import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ValidateTokenDto } from "./dto/validate-token.dto";
import { RefreshTokenGuard } from "./guards/refresh-token.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { AuthenticatedRequest } from "../types/request.types";
import { GoogleLoginDto } from "./dto/google-login.dto";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login user" })
  @ApiResponse({ status: 200, description: "User logged in successfully" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(loginDto);

    // Set refresh token as HTTP-only cookie
    response.cookie("refresh_token", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  async refreshTokens(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    const userId = req.user["sub"];
    const refreshToken = req.user["refreshToken"];

    const tokens = await this.authService.refreshTokens(userId, refreshToken);

    // Set new refresh token as HTTP-only cookie
    response.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout user" })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    await this.authService.logout(req.user["userId"]);

    // Clear refresh token cookie
    response.clearCookie("refresh_token");

    return { message: "Logged out successfully" };
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify email address" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.verifyEmail(
      verifyEmailDto.email,
      verifyEmailDto.token
    );

    // Set refresh token as HTTP-only cookie
    response.cookie("refresh_token", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: result.message,
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Post("resend-verification")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend email verification" })
  @ApiResponse({ status: 200, description: "Verification email sent" })
  async resendVerification(
    @Body() resendVerificationDto: ResendVerificationDto
  ) {
    return this.authService.resendVerificationEmail(
      resendVerificationDto.email
    );
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  async googleAuth() {
    // This route initiates the Google OAuth flow
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.googleCallback(req);

    // Set refresh token as HTTP-only cookie
    response.cookie("refresh_token", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const redirectUrl = `${frontendUrl}/auth/google/success?token=${result.tokens.accessToken}`;

    response.redirect(redirectUrl);
  }

  @Post("google/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with Google access token" })
  @ApiResponse({
    status: 200,
    description: "User logged in successfully with Google",
  })
  async googleLogin(
    @Body() googleLoginDto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.googleLogin(googleLoginDto);

    // Set refresh token as HTTP-only cookie
    response.cookie("refresh_token", result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: result.user,
      accessToken: result.tokens.accessToken,
    };
  }

  @Get("validate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Validate JWT access token" })
  @ApiResponse({
    status: 200,
    description: "Token validation result",
    schema: {
      type: "object",
      properties: {
        isValid: { type: "boolean" },
        user: { type: "object" },
        payload: { type: "object" },
        message: { type: "string" },
      },
    },
  })
  async validateToken(@Query("token") token: string) {
    if (!token) {
      return {
        isValid: false,
        message: "Token is required",
      };
    }
    return this.authService.validateToken(token);
  }
}
