import { IsEnum, IsOptional, IsString, IsDateString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus, PaymentStatus } from "../schemas/order.schema";

export class UpdateOrderStatusDto {
  @ApiProperty({ description: "Order status", enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ description: "Payment status", enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: "Payment ID" })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiPropertyOptional({ description: "Payment method" })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: "Tracking number" })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: "Estimated delivery date" })
  @IsOptional()
  @IsDateString()
  estimatedDelivery?: Date;

  @ApiPropertyOptional({ description: "Status update notes" })
  @IsOptional()
  @IsString()
  notes?: string;
}
