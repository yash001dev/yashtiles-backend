import {
  Controller,
  Post,
  Body,
  Headers,
  RawBody,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Res,
  Get,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import { FilesInterceptor } from "@nestjs/platform-express";
import { PaymentsService } from "./payments.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { VerifyPaymentDto } from "./dto/verify-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import Payu from "payu-websdk";
import { memoryStorage } from "multer";
import { Response } from "express";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService
  ) {}

  @Post("stripe/create-intent")
  @ApiOperation({ summary: "Create Stripe payment intent" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  createStripePaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto
  ) {
    return this.paymentsService.createStripePaymentIntent(
      createPaymentIntentDto
    );
  }

  @Post("razorpay/create-order")
  @ApiOperation({ summary: "Create Razorpay order" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  createRazorpayOrder(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createRazorpayOrder(createPaymentIntentDto);
  }

  @Post("stripe/verify")
  @ApiOperation({ summary: "Verify Stripe payment" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  verifyStripePayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyStripePayment(verifyPaymentDto);
  }

  @Post("razorpay/verify")
  @ApiOperation({ summary: "Verify Razorpay payment" })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  verifyRazorpayPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyRazorpayPayment(verifyPaymentDto);
  }

  @Post("stripe/webhook")
  @ApiOperation({ summary: "Stripe webhook endpoint" })
  handleStripeWebhook(
    @Headers("stripe-signature") signature: string,
    @RawBody() payload: Buffer
  ) {
    return this.paymentsService.handleStripeWebhook(signature, payload);
  }

  @Post("payu/initiate")
  @ApiOperation({ summary: "Initiate PayU payment with frame images" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FilesInterceptor("frameImages", 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10, // max 10 files
      },
      fileFilter: (req, file, cb) => {
        console.log(
          "File filter called for:",
          file.originalname,
          file.mimetype
        );
        if (file.mimetype.startsWith("image/")) {
          cb(null, true);
        } else {
          cb(new Error("Only image files are allowed"), false);
        }
      },
    })
  )
  async initiatePayUPayment(
    @UploadedFiles() frameImages: Express.Multer.File[],
    @Body() body: any
  ) {
    console.log("=== Controller Debug ===");
    console.log(
      "frameImages in controller:",
      frameImages ? frameImages.length : "null/undefined"
    );
    console.log("body in controller:", Object.keys(body));
    console.log(
      "frameImages details:",
      frameImages?.map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      }))
    );

    return this.paymentsService.initiatePayUPaymentWithImages(
      frameImages,
      body
    );
  }

  @Post("payu/callback")
  @ApiOperation({ summary: "PayU payment callback" })
  @ApiConsumes("application/x-www-form-urlencoded")
  async handlePayUCallback(@Body() body: any, @Res() res: Response) {
    console.log("=== PayU Callback Received ===");
    console.log("Callback body:", body);
    console.log("Callback keys:", Object.keys(body));

    try {
      const result = await this.paymentsService.handlePayUCallback(body);

      // Get frontend URL from config
      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:3001";

      // Redirect to frontend pages based on payment status
      if (result.success) {
        const redirectUrl = `${frontendUrl}/payment-success?txnid=${body.txnid}&status=${body.status}&orderId=${result.orderId}&paymentMethod=payu`;
        console.log("Redirecting to success page:", redirectUrl);
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `${frontendUrl}/payment-failure?txnid=${body.txnid}&status=${body.status}&orderId=${result.orderId}&error=${encodeURIComponent(result.message)}`;
        console.log("Redirecting to failure page:", redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error in PayU callback:", error);
      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:3001";
      const redirectUrl = `${frontendUrl}/payment-failure?txnid=${body.txnid}&status=error&error=${encodeURIComponent(error.message)}`;
      console.log("Redirecting to error page:", redirectUrl);
      res.redirect(redirectUrl);
    }
  }

  @Get("payu/callback")
  @ApiOperation({ summary: "PayU payment callback (GET)" })
  async handlePayUCallbackGet(@Query() query: any, @Res() res: Response) {
    console.log("=== PayU Callback GET Received ===");
    console.log("Callback query:", query);

    try {
      const result = await this.paymentsService.handlePayUCallback(query);

      // Get frontend URL from config
      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:3001";

      // Redirect to frontend pages based on payment status
      if (result.success) {
        const redirectUrl = `${frontendUrl}/payment-success?txnid=${query.txnid}&status=${query.status}&orderId=${result.orderId}&paymentMethod=payu`;
        console.log("Redirecting to success page:", redirectUrl);
        res.redirect(redirectUrl);
      } else {
        const redirectUrl = `${frontendUrl}/payment-failure?txnid=${query.txnid}&status=${query.status}&orderId=${result.orderId}&error=${encodeURIComponent(result.message)}`;
        console.log("Redirecting to failure page:", redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error("Error in PayU callback GET:", error);
      const frontendUrl =
        this.configService.get<string>("FRONTEND_URL") ||
        "http://localhost:3001";
      const redirectUrl = `${frontendUrl}/payment-failure?txnid=${query.txnid}&status=error&error=${encodeURIComponent(error.message)}`;
      console.log("Redirecting to error page:", redirectUrl);
      res.redirect(redirectUrl);
    }
  }

  @Post("payu/generate-hash")
  generatePayUHash(@Body() body: any) {
    const { key, txnid, amount, productinfo, firstname, email, salt } = body;
    const udf1 = body.udf1 || "";
    const udf2 = body.udf2 || "";
    const udf3 = body.udf3 || "";
    const udf4 = body.udf4 || "";
    const udf5 = body.udf5 || "";
    const payu = new Payu({ key, salt }, "TEST");
    const hash = payu.hasher.generatePaymentHash({
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    });
    const hashString = [
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      "",
      "",
      "",
      "",
      "",
      salt,
    ].join("|");
    return { hash, hashString };
  }

  @Post("payu/verify")
  async verifyPayUPayment(@Body() body: any) {
    const { txnid } = body;
    return this.paymentsService.verifyPayUPayment(txnid);
  }

  @Get("payu/test")
  @ApiOperation({ summary: "Test PayU endpoint" })
  testPayUEndpoint() {
    return {
      message: "PayU endpoint is working",
      timestamp: new Date().toISOString(),
    };
  }
}
