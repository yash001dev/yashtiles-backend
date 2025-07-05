import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { OrdersService } from "../orders/orders.service";
import { PaymentStatus, OrderStatus } from "../orders/schemas/order.schema";
import * as crypto from 'crypto';
import { CreateOrderDto } from '../orders/dto/create-order.dto';
import Payu from 'payu-websdk';


@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService
  ) {
    // Initialize Stripe
    this.stripe = new Stripe(
      this.configService.get<string>("STRIPE_SECRET_KEY"),
      {
        apiVersion: "2023-10-16",
      }
    );

    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>("RAZORPAY_KEY_ID"),
      key_secret: this.configService.get<string>("RAZORPAY_KEY_SECRET"),
    });
  }

  async createStripePaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto
  ) {
    try {
      const { amount, currency = "usd", orderId } = createPaymentIntentDto;

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          orderId,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new BadRequestException(`Stripe error: ${error.message}`);
    }
  }

  async createRazorpayOrder(createPaymentIntentDto: CreatePaymentIntentDto) {
    try {
      const { amount, currency = "INR", orderId } = createPaymentIntentDto;

      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency.toUpperCase(),
        receipt: orderId,
        notes: {
          orderId,
        },
      };

      const order = await this.razorpay.orders.create(options);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: this.configService.get<string>("RAZORPAY_KEY_ID"),
      };
    } catch (error) {
      throw new BadRequestException(`Razorpay error: ${error.message}`);
    }
  }

  async verifyStripePayment(verifyPaymentDto: VerifyPaymentDto) {
    try {
      const { paymentIntentId, orderId } = verifyPaymentDto;

      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "succeeded") {
        // Update order payment status
        const order = await this.ordersService.findOne(orderId);
        await this.ordersService.updateStatus(orderId, {
          status: order.status,
          paymentStatus: PaymentStatus.PAID,
          paymentId: paymentIntentId,
          paymentMethod: "stripe",
        } as any);

        return { success: true, message: "Payment verified successfully" };
      } else {
        throw new BadRequestException("Payment not completed");
      }
    } catch (error) {
      throw new BadRequestException(
        `Payment verification failed: ${error.message}`
      );
    }
  }

  async verifyRazorpayPayment(verifyPaymentDto: VerifyPaymentDto) {
    try {
      const { paymentId, orderId, signature } = verifyPaymentDto;

      // Verify signature
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac(
          "sha256",
          this.configService.get<string>("RAZORPAY_KEY_SECRET")
        )
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (expectedSignature === signature) {
        // Update order payment status
        const order = await this.ordersService.findOne(
          verifyPaymentDto.orderId
        );
        await this.ordersService.updateStatus(verifyPaymentDto.orderId, {
          status: order.status,
          paymentStatus: PaymentStatus.PAID,
          paymentId,
          paymentMethod: "razorpay",
        } as any);

        return { success: true, message: "Payment verified successfully" };
      } else {
        throw new BadRequestException("Invalid payment signature");
      }
    } catch (error) {
      throw new BadRequestException(
        `Payment verification failed: ${error.message}`
      );
    }
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get<string>("STRIPE_WEBHOOK_SECRET")
      );

      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const orderId = paymentIntent.metadata.orderId;

          if (orderId) {
            const order = await this.ordersService.findOne(orderId);
            await this.ordersService.updateStatus(orderId, {
              status: order.status,
              paymentStatus: PaymentStatus.PAID,
              paymentId: paymentIntent.id,
              paymentMethod: "stripe",
            } as any);
          }
          break;

        case "payment_intent.payment_failed":
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          const failedOrderId = failedPayment.metadata.orderId;

          if (failedOrderId) {
            const order = await this.ordersService.findOne(failedOrderId);
            await this.ordersService.updateStatus(failedOrderId, {
              status: order.status,
              paymentStatus: PaymentStatus.FAILED,
              paymentId: failedPayment.id,
              paymentMethod: "stripe",
            } as any);
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }

  async initiatePayUPayment(body: any) {
    // Create a pending order before redirecting to PayU
    let txnid = body.txnid || Math.random().toString(36).substr(2, 12);
    let amount = body.amount;
    let productinfo = body.productinfo;
    let firstname = body.firstname;
    let email = body.email;
    let phone = body.phone;
    let udf1 = body.udf1 || '';
    let udf2 = body.udf2 || '';
    let udf3 = body.udf3 || '';
    let udf4 = body.udf4 || '';
    let udf5 = body.udf5 || '';
    let orderId = null;
    if (body.order) {
      const orderDto = body.order;
      // txnid = orderDto.tempTxnId || txnid;
      amount = orderDto.totalAmount;
      productinfo = 'FrameIt Custom Frame';
      firstname = orderDto.shippingAddress.firstName;
      email = orderDto.shippingAddress.email;
      phone = orderDto.shippingAddress.phone || body.phone;
      // Store txnid in orderDto for lookup
      orderDto.txnid = txnid;
      // Set status to PENDING
      orderDto.status = OrderStatus.PENDING;
      const userId = body.userId || null;
      const order = await this.ordersService.create(orderDto, userId);
      orderId = (order as any)._id.toString();
    }
    const surl = body.surl;
    const furl = body.furl;
    const key = this.configService.get<string>("PAYU_API_KEY");
    const salt = this.configService.get<string>("PAYU_SALT");
    const payu = new Payu({ key, salt }, process.env.NODE_ENV === 'production' ? 'PROD' : 'TEST');
    const paymentParams = {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5
    };
    const paramsHtml = payu.paymentInitiate(paymentParams);
    // Extract input fields from the HTML form
    const params: Record<string, string> = {};
    const inputRegex = /<input[^>]*name=['"]([^'"]+)['"][^>]*value=['"]([^'"]*)['"][^>]*>/g;
    let match;
    while ((match = inputRegex.exec(paramsHtml)) !== null) {
      params[match[1]] = match[2];
    }
    return {
      action: process.env.NODE_ENV === 'production' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment',
      params,
      txnid,
      orderId
    };
  }

  async verifyPayUPayment(txnid: string) {
    const key = this.configService.get<string>("PAYU_API_KEY");
    const salt = this.configService.get<string>("PAYU_SALT");
    const payu = new Payu({ key, salt }, 'TEST');
    return payu.verifyPayment(txnid);
  }

  async handlePayUCallback(body: any) {
    // Validate hash and check status
    const key = this.configService.get<string>("PAYU_API_KEY");
    const salt = this.configService.get<string>("PAYU_SALT");
    const payu = new Payu({ key, salt }, 'TEST');
    const isValid = payu.hasher.validateResponseHash(body);
    if (isValid && body.status === 'success') {
      // Find the order by txnid and update status to CONFIRMED
      const txnid = body.txnid;
      let order = await this.ordersService.getOrderByTxnId(txnid);
      if (order && order._id) {
        await this.ordersService.updateStatus(order._id.toString(), { status: OrderStatus.CONFIRMED });
      }
      return { success: true, status: body.status };
    }
    return { success: false, status: body.status };
  }
}
