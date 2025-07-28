import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSizeDto {
  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
