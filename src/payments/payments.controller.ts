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
}