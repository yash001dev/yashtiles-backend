import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsEmail,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus, PaymentStatus } from "../schemas/order.schema";

export class BulkUpdateOrderDto {
  @ApiProperty({ description: "Array of order IDs to update", type: [String] })
  @IsArray()
  @IsString({ each: true })
  orderIds: string[];

  @ApiPropertyOptional({
    description: "New status for all orders",
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "New payment status for all orders",
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: "Tracking number for all orders" })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: "Notes to add to status history" })
  @IsOptional()
  @IsString()
  notes?: string;
}
