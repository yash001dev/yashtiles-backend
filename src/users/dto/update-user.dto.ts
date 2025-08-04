import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsString, IsDate, IsBoolean, IsObject, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { AddressDto } from "./address-dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @IsOptional()
  @IsDate()
  passwordResetExpires?: Date;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @IsOptional()
  @IsDate()
  lastLoginAt?: Date;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  googleAccessToken?: string;

  @IsOptional()
  @IsString()
  googleRefreshToken?: string;
  
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
