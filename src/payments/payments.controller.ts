import {
  Controller,
  Post,
  Body,
  Headers,
  RawBody,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as crypto from 'crypto';
import Payu from 'payu-websdk';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe/create-intent')
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  createStripePaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createStripePaymentIntent(createPaymentIntentDto);
  }

  @Post('razorpay/create-order')
  @ApiOperation({ summary: 'Create Razorpay order' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  createRazorpayOrder(@Body() createPaymentIntentDto: CreatePaymentIntentDto) {
    return this.paymentsService.createRazorpayOrder(createPaymentIntentDto);
  }

  @Post('stripe/verify')
  @ApiOperation({ summary: 'Verify Stripe payment' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  verifyStripePayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyStripePayment(verifyPaymentDto);
  }

  @Post('razorpay/verify')
  @ApiOperation({ summary: 'Verify Razorpay payment' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  verifyRazorpayPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyRazorpayPayment(verifyPaymentDto);
  }

  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() payload: Buffer,
  ) {
    return this.paymentsService.handleStripeWebhook(signature, payload);
  }

  @Post('payu/initiate')
  @ApiOperation({ summary: 'Initiate PayU payment' })
  async initiatePayUPayment(@Body() body: any) {
    return this.paymentsService.initiatePayUPayment(body);
  }

  @Post('payu/callback')
  @ApiOperation({ summary: 'PayU payment callback' })
  async handlePayUCallback(@Body() body: any) {
    return this.paymentsService.handlePayUCallback(body);
  }

  @Post('payu/generate-hash')
  generatePayUHash(@Body() body: any) {
    const { key, txnid, amount, productinfo, firstname, email, salt } = body;
    const udf1 = body.udf1 || '';
    const udf2 = body.udf2 || '';
    const udf3 = body.udf3 || '';
    const udf4 = body.udf4 || '';
    const udf5 = body.udf5 || '';
    const payu = new Payu({ key, salt }, 'TEST');
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
      udf5
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
      '', '', '', '', '',
      salt
    ].join('|');
    return { hash, hashString };
  }

  @Post('payu/verify')
  async verifyPayUPayment(@Body() body: any) {
    const { txnid } = body;
    return this.paymentsService.verifyPayUPayment(txnid);
  }
}