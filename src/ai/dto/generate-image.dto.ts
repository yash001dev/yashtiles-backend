import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum ImageModel {
  STABLE_DIFFUSION_XL = "stability.stable-diffusion-xl-v1",
  STABLE_DIFFUSION_XL_1024 = "stability.stable-diffusion-xl-v1-1024x1024",
  TITAN_IMAGE_GENERATOR = "amazon.titan-image-generator-v1",
}

export enum ImageStyle {
  PHOTOGRAPHIC = "photographic",
  DIGITAL_ART = "digital-art",
  CINEMATIC = "cinematic",
  ANIME = "anime",
  CARTOON = "cartoon",
  FANTASY = "fantasy",
  NEON_PUNK = "neon-punk",
  ISOMETRIC = "isometric",
  LOW_POLY = "low-poly",
  ORIGAMI = "origami",
  MODELING = "modeling",
}

export class GenerateImageDto {
  @ApiProperty({
    description: "Text prompt for image generation",
    example: "A beautiful sunset over mountains with vibrant colors",
  })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({
    description: "Negative prompt to avoid certain elements",
    example: "blurry, low quality, distorted",
  })
  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @ApiPropertyOptional({
    description: "AI model to use for generation",
    enum: ImageModel,
    default: ImageModel.TITAN_IMAGE_GENERATOR,
  })
  @IsOptional()
  @IsEnum(ImageModel)
  model?: ImageModel = ImageModel.TITAN_IMAGE_GENERATOR;

  @ApiPropertyOptional({
    description: "Image style to apply",
    enum: ImageStyle,
  })
  @IsOptional()
  @IsEnum(ImageStyle)
  style?: ImageStyle;

  @ApiPropertyOptional({
    description: "Image width in pixels",
    minimum: 512,
    maximum: 1024,
    default: 1024,
  })
  @IsOptional()
  @IsNumber()
  @Min(512)
  @Max(1024)
  width?: number = 1024;

  @ApiPropertyOptional({
    description: "Image height in pixels",
    minimum: 512,
    maximum: 1024,
    default: 1024,
  })
  @IsOptional()
  @IsNumber()
  @Min(512)
  @Max(1024)
  height?: number = 1024;

  @ApiPropertyOptional({
    description: "Guidance scale for image generation",
    minimum: 1,
    maximum: 20,
    default: 7.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  guidanceScale?: number = 7.5;

  @ApiPropertyOptional({
    description: "Number of inference steps",
    minimum: 10,
    maximum: 50,
    default: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(50)
  steps?: number = 30;
}
