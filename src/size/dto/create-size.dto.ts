import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateSizeDto {
  @IsString()
  size: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
