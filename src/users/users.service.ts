import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { User, UserDocument } from "./schemas/user.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { PaginationDto } from "../common/dto/pagination.dto";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select("-password -refreshToken")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select("-password").exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserDocument> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select("-password -refreshToken")
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException("User not found");
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<void> {
    let hashedToken = null;
    if (refreshToken) {
      hashedToken = await bcrypt.hash(refreshToken, 12);
    }
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedToken }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastLoginAt: new Date() })
      .exec();
  }

  async setEmailVerificationToken(
    userId: string,
    token: string
  ): Promise<void> {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.userModel
      .findByIdAndUpdate(userId, {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      })
      .exec();
  }

  async verifyEmail(email: string, token: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({
        email,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new NotFoundException("Invalid or expired verification token");
    }

    // Clear verification fields and mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    return user.save();
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .exec();
  }
}
