import {
  IsOptional,
  IsString,
  IsNumber,
  IsEmail,
  IsEnum,
  ValidateNested,
  IsArray,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus, PaymentStatus } from "../schemas/order.schema";

class UpdateShippingAddressDto {
  @ApiPropertyOptional({ description: "First name" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: "Last name" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: "Email address" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Street address" })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: "City" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "State" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: "ZIP code" })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ description: "Country" })
  @IsOptional()
  @IsString()
  country?: string;
}

class UpdateOrderItemDto {
  @ApiPropertyOptional({ description: "Product ID" })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: "Quantity", minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: "Price per item" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ description: "Frame size" })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ description: "Frame type" })
  @IsOptional()
  @IsString()
  frameType?: string;

  @ApiPropertyOptional({ description: "Image URL" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: "Special notes for this item" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: "Order status", enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: "Payment status", enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: "Total amount" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiPropertyOptional({ description: "Shipping cost" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional({ description: "Tax amount" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

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
  estimatedDelivery?: Date;

  @ApiPropertyOptional({ description: "Order notes" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: "Updated shipping address",
    type: UpdateShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateShippingAddressDto)
  shippingAddress?: UpdateShippingAddressDto;

  @ApiPropertyOptional({
    description: "Updated order items",
    type: [UpdateOrderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];

  @ApiPropertyOptional({ description: "Notes for status history update" })
  @IsOptional()
  @IsString()
  statusNotes?: string;
}
