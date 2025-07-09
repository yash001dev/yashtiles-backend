import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus, PaymentStatus } from "../schemas/order.schema";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class SearchOrderDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Search by order number" })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiPropertyOptional({ description: "Search by customer email" })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiPropertyOptional({
    description: "Search by customer name (first or last)",
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: "Search by customer phone" })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({
    description: "Filter by order status",
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "Filter by payment status",
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ description: "Search from date (YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: "Search to date (YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: "Search by tracking number" })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: "Minimum order amount" })
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({ description: "Maximum order amount" })
  @IsOptional()
  maxAmount?: number;
}
