import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsOptional, IsEmail } from "class-validator";

export class PayUInitiateWithImagesDto {
  @ApiProperty({ description: "Order data as JSON string" })
  @IsString()
  order: string;

  @ApiProperty({ description: "Success URL" })
  @IsString()
  surl: string;

  @ApiProperty({ description: "Failure URL" })
  @IsString()
  furl: string;

  @ApiProperty({ description: "User ID" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: "PayU merchant key" })
  @IsString()
  key: string;

  @ApiProperty({ description: "Transaction ID" })
  @IsOptional()
  @IsString()
  txnid?: string;

  @ApiProperty({ description: "Payment amount" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Product information" })
  @IsOptional()
  @IsString()
  productinfo?: string;

  @ApiProperty({ description: "First name" })
  @IsString()
  firstname: string;

  @ApiProperty({ description: "Email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: "User defined field 1" })
  @IsOptional()
  @IsString()
  udf1?: string;

  @ApiProperty({ description: "User defined field 2" })
  @IsOptional()
  @IsString()
  udf2?: string;

  @ApiProperty({ description: "User defined field 3" })
  @IsOptional()
  @IsString()
  udf3?: string;

  @ApiProperty({ description: "User defined field 4" })
  @IsOptional()
  @IsString()
  udf4?: string;

  @ApiProperty({ description: "User defined field 5" })
  @IsOptional()
  @IsString()
  udf5?: string;

  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "Frame images to upload",
  })
  frameImages: Express.Multer.File[];
}
