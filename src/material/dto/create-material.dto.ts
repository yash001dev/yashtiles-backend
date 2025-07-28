import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
