import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { OrdersService } from "../orders/orders.service";
import { PaymentStatus } from "../orders/schemas/order.schema";

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
}
