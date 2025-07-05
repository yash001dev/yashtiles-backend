import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "../../common/decorators/roles.decorator";

export class CreateUserDto {
  @ApiProperty({ description: "User first name" })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: "User last name" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: "User email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password", minLength: 6 })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ description: "User phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: "User role",
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: "User avatar URL" })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: "Email verification status" })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ description: "Google access token" })
  @IsOptional()
  @IsString()
  googleAccessToken?: string;

  @ApiPropertyOptional({ description: "Google refresh token" })
  @IsOptional()
  @IsString()
  googleRefreshToken?: string;
}
