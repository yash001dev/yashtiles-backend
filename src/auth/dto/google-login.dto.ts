import { IsEmail, IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GoogleLoginDto {
  @ApiProperty({ description: "Google access token" })
  @IsString()
  accessToken: string;

  @ApiProperty({ description: "User email from Google" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User first name from Google" })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: "User last name from Google" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: "Google user ID" })
  @IsOptional()
  @IsString()
  googleId?: string;

  @ApiPropertyOptional({ description: "User avatar URL from Google" })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: "Google refresh token" })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
