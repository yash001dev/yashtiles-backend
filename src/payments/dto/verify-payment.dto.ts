import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Payment ID' })
  @IsString()
  paymentId: string;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Payment signature (for Razorpay)' })
  @IsOptional()
  @IsString()
  signature?: string;

  @ApiPropertyOptional({ description: 'Payment Intent ID (for Stripe)' })
  @IsOptional()
  @IsString()
  paymentIntentId?: string;
}