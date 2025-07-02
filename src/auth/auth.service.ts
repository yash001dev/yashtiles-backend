import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { UsersService } from "../users/users.service";
import { NotificationsService } from "../notifications/notifications.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { UserDocument } from "../users/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const user = await this.usersService.create(registerDto);

    // Generate email verification token
    const verificationToken = uuidv4();
    await this.usersService.setEmailVerificationToken(
      user._id.toString(),
      verificationToken
    );

    // Send welcome email with verification link
    await this.notificationsService.sendWelcomeEmailWithVerification(
      user.email,
      user.firstName,
      verificationToken
    );

    // Note: User will get tokens only after email verification
    return {
      message:
        "Registration successful! Please check your email to verify your account.",
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        "Please verify your email address before logging in. Check your inbox for the verification link."
      );
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );

    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );
    await this.usersService.updateLastLogin(user._id.toString());

    return {
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException("Access denied");
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException("Access denied");
    }

    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user exists
      return { message: "If the email exists, a reset link has been sent" };
    }

    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.update(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // Send password reset email
    await this.notificationsService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken
    );

    return { message: "If the email exists, a reset link has been sent" };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (
      !user ||
      user.passwordResetToken !== resetPasswordDto.token ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    await this.usersService.update(user._id.toString(), {
      password: resetPasswordDto.newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // Send password changed confirmation email
    await this.notificationsService.sendPasswordChangedEmail(
      user.email,
      user.firstName
    );

    return { message: "Password has been reset successfully" };
  }

  async verifyEmail(email: string, token: string) {
    try {
      const user = await this.usersService.verifyEmail(email, token);

      // Send success email
      await this.notificationsService.sendEmailVerificationSuccess(
        user.email,
        user.firstName
      );

      // Generate tokens for verified user
      const tokens = await this.generateTokens(
        user._id.toString(),
        user.email,
        user.role
      );

      await this.usersService.updateRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      return {
        message: "Email verified successfully! You can now log in.",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        tokens,
      };
    } catch (error) {
      throw new BadRequestException("Invalid or expired verification token");
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    await this.usersService.setEmailVerificationToken(
      user._id.toString(),
      verificationToken
    );

    // Send verification email
    await this.notificationsService.sendEmailVerificationOnly(
      user.email,
      user.firstName,
      verificationToken
    );

    return { message: "Verification email sent! Please check your inbox." };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto) {
    const {
      email,
      firstName,
      lastName,
      avatar,
      accessToken,
      refreshToken,
      googleId,
    } = googleLoginDto;

    // Check if user already exists by email or Google ID
    let user = await this.usersService.findByEmail(email);

    // If not found by email, try to find by Google ID
    if (!user && googleId) {
      user = await this.usersService.findByGoogleId(googleId);
    }

    if (user) {
      // Update existing user's Google tokens and info
      await this.usersService.update(user._id.toString(), {
        googleId: googleId || user.googleId,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
        avatar: avatar || user.avatar,
        isEmailVerified: true, // Google emails are verified
      });
    } else {
      // Create new user with Google data
      const createUserDto = {
        firstName,
        lastName,
        email,
        password: "", // No password for Google users
        avatar,
        googleId,
        isEmailVerified: true,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken,
      };

      user = await this.usersService.create(createUserDto);

      // Send welcome email (Google emails are already verified)
      await this.notificationsService.sendEmailVerificationSuccess(
        user.email,
        user.firstName
      );
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );
    await this.usersService.updateRefreshToken(
      user._id.toString(),
      tokens.refreshToken
    );
    await this.usersService.updateLastLogin(user._id.toString());

    return {
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }

  async googleCallback(req: any) {
    const { user } = req;

    if (!user) {
      throw new UnauthorizedException("Google authentication failed");
    }

    const googleLoginDto: GoogleLoginDto = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      googleId: user.googleId,
      avatar: user.avatar,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
    };

    return this.googleLogin(googleLoginDto);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
