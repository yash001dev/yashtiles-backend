import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import Razorpay from "razorpay";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { OrdersService } from "../orders/orders.service";
import { PaymentStatus, OrderStatus } from "../orders/schemas/order.schema";
import * as crypto from "crypto";
import { CreateOrderDto } from "../orders/dto/create-order.dto";
import Payu from "payu-websdk";
import { S3Service } from "../s3/s3.service";
import * as https from "https";
import * as http from "http";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private razorpay: Razorpay;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
    private s3Service: S3Service
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
    let udf1 = body.udf1 || "";
    let udf2 = body.udf2 || "";
    let udf3 = body.udf3 || "";
    let udf4 = body.udf4 || "";
    let udf5 = body.udf5 || "";
    let orderId = null;
    if (body.order) {
      const orderDto = body.order;
      // txnid = orderDto.tempTxnId || txnid;
      amount = orderDto.totalAmount;
      productinfo = "FrameIt Custom Frame";
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
    const payu = new Payu(
      { key, salt },
      process.env.NODE_ENV === "production" ? "PROD" : "TEST"
    );
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
      udf5,
    };
    const paramsHtml = payu.paymentInitiate(paymentParams);
    // Extract input fields from the HTML form
    const params: Record<string, string> = {};
    const inputRegex =
      /<input[^>]*name=['"]([^'"]+)['"][^>]*value=['"]([^'"]*)['"][^>]*>/g;
    let match;
    while ((match = inputRegex.exec(paramsHtml)) !== null) {
      params[match[1]] = match[2];
    }
    return {
      action:
        process.env.NODE_ENV === "production"
          ? "https://secure.payu.in/_payment"
          : "https://test.payu.in/_payment",
      params,
      txnid,
      orderId,
    };
  }

  async verifyPayUPayment(txnid: string) {
    const key = this.configService.get<string>("PAYU_API_KEY");
    const salt = this.configService.get<string>("PAYU_SALT");
    const payu = new Payu({ key, salt }, "TEST");
    return payu.verifyPayment(txnid);
  }

  async handlePayUCallback(body: any) {
    // Validate hash and check status
    const key = this.configService.get<string>("PAYU_API_KEY");
    const salt = this.configService.get<string>("PAYU_SALT");
    const env = process.env.NODE_ENV === "production" ? "PROD" : "TEST";
    const payu = new Payu({ key, salt }, env);
    const isValid = payu.hasher.validateResponseHash(body);

    if (isValid && body.status === "success") {
      // Find the order by txnid and update status to CONFIRMED
      const txnid = body.txnid;
      let order = await this.ordersService.getOrderByTxnId(txnid);

      if (order && order._id) {
        // Update order status to CONFIRMED and payment status to PAID
        await this.ordersService.updateStatus(order._id.toString(), {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
          paymentId: body.payuMoneyId || body.mihpayid,
          paymentMethod: "payu",
        } as any);

        console.log(
          `Order ${order._id} marked as CONFIRMED after successful PayU payment`
        );
      }

      return {
        success: true,
        status: body.status,
        message: "Payment successful and order confirmed",
      };
    }

    return {
      success: false,
      status: body.status,
      message: "Payment failed or invalid",
    };
  }

  async initiatePayUPaymentWithImages(
    frameImages: Express.Multer.File[],
    body: any
  ) {
    try {
      console.log("=== PayU Payment Initiation Debug ===");
      console.log(
        "frameImages received:",
        frameImages ? frameImages.length : "null/undefined"
      );
      console.log("body keys:", Object.keys(body));
      console.log("body:", body);

      // Generate transaction ID
      let txnid = body.txnid || Math.random().toString(36).substr(2, 12);

      // Parse the order data (it might come as JSON string in form data)
      let orderData;
      try {
        orderData =
          typeof body.order === "string" ? JSON.parse(body.order) : body.order;
      } catch (error) {
        console.error("Error parsing order data:", error);
        throw new BadRequestException("Invalid order data format");
      }

      console.log("Parsed order data:", orderData);

      if (!orderData || !orderData.items || !Array.isArray(orderData.items)) {
        throw new BadRequestException("Order items are required");
      }

      if (!frameImages || frameImages.length === 0) {
        console.log("frameImages validation failed:", {
          frameImages: frameImages,
          length: frameImages ? frameImages.length : "N/A",
        });
        throw new BadRequestException("Frame images are required");
      }

      if (frameImages.length !== orderData.items.length) {
        throw new BadRequestException(
          "Number of frame images must match number of order items"
        );
      }

      // Create a temporary order ID for S3 upload
      const tempOrderId = `temp-${Date.now()}`;

      // Upload frame images to S3
      console.log("Uploading frame images to S3...");
      const uploadedImageUrls: string[] = [];

      for (let i = 0; i < frameImages.length; i++) {
        const image = frameImages[i];
        const fileName = image.originalname || `frame-${i}.jpg`;

        try {
          const s3Url = await this.s3Service.uploadFrameImage(
            image.buffer,
            fileName,
            tempOrderId,
            i
          );
          uploadedImageUrls.push(s3Url);
          console.log(
            `Uploaded image ${i + 1}/${frameImages.length}: ${s3Url}`
          );
        } catch (error) {
          console.error(`Error uploading image ${i}:`, error);
          throw new BadRequestException(
            `Failed to upload frame image ${i + 1}`
          );
        }
      }

      // Update order items with S3 image URLs
      orderData.items.forEach((item, index) => {
        item.imageUrl = uploadedImageUrls[index];
      });

      // Set order details
      const amount = orderData.totalAmount;
      const productinfo = "FrameIt Custom Frame";
      const firstname = orderData.shippingAddress.firstName;
      const email = orderData.shippingAddress.email;
      const phone = orderData.shippingAddress.phone || body.phone;

      // Store txnid in orderData for lookup
      orderData.txnid = txnid;
      // Set status to PROCESSING (in-progress)
      orderData.status = OrderStatus.PROCESSING;
      orderData.paymentStatus = PaymentStatus.PENDING;

      // Create order in database
      const userId = body.userId || null;
      const order = await this.ordersService.create(orderData, userId);
      const orderId = (order as any)._id.toString();

      console.log(`Order created with ID: ${orderId}, Status: PROCESSING`);

      // Prepare PayU payment parameters
      const surl = body.surl;
      const furl = body.furl;
      const key = this.configService.get<string>("PAYU_API_KEY");
      const salt = this.configService.get<string>("PAYU_SALT");

      const udf1 = body.udf1 || "";
      const udf2 = body.udf2 || "";
      const udf3 = body.udf3 || "";
      const udf4 = body.udf4 || "";
      const udf5 = body.udf5 || "";

      const payu = new Payu(
        { key, salt },
        process.env.NODE_ENV === "production" ? "PROD" : "TEST"
      );

      const paymentParams = {
        key,
        txnid,
        amount: amount.toString(),
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
        udf5,
      };

      const paramsHtml = payu.paymentInitiate(paymentParams);

      // Extract input fields from the HTML form
      const params: Record<string, string> = {};
      const inputRegex =
        /<input[^>]*name=['"]([^'"]+)['"][^>]*value=['"]([^'"]*)['"][^>]*>/g;
      let match;
      while ((match = inputRegex.exec(paramsHtml)) !== null) {
        params[match[1]] = match[2];
      }

      return {
        success: true,
        action:
          process.env.NODE_ENV === "production"
            ? "https://secure.payu.in/_payment"
            : "https://test.payu.in/_payment",
        params,
        txnid,
        orderId,
        uploadedImages: uploadedImageUrls,
        message: "Order created and frame images uploaded successfully",
      };
    } catch (error) {
      console.error("Error in initiatePayUPaymentWithImages:", error);
      throw new BadRequestException(
        error.message || "Failed to initiate PayU payment"
      );
    }
  }
}
