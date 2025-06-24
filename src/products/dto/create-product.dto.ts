import { IsString, IsArray, IsNumber, IsBoolean, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PricingDto {
  @ApiProperty({ description: 'Size name' })
  @IsString()
  size: string;

  @ApiProperty({ description: 'Price for this size' })
  @IsNumber()
  @Min(0)
  price: number;
}

class SpecificationsDto {
  @ApiProperty({ description: 'Material information' })
  @IsString()
  material: string;

  @ApiProperty({ description: 'Weight information' })
  @IsString()
  weight: string;

  @ApiProperty({ description: 'Dimensions information' })
  @IsString()
  dimensions: string;

  @ApiProperty({ description: 'Care instructions' })
  @IsString()
  care: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Product category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Pricing for different sizes', type: [PricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingDto)
  pricing: PricingDto[];

  @ApiProperty({ description: 'Available sizes' })
  @IsArray()
  @IsString({ each: true })
  availableSizes: string[];

  @ApiProperty({ description: 'Available frame types' })
  @IsArray()
  @IsString({ each: true })
  frameTypes: string[];

  @ApiProperty({ description: 'Product images URLs' })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiPropertyOptional({ description: 'Is product active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Product specifications', type: SpecificationsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications?: SpecificationsDto;

  @ApiPropertyOptional({ description: 'Product tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}