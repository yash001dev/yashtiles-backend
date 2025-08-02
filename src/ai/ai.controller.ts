import { Controller, Post, Body, HttpStatus, HttpCode } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AiService } from "./ai.service";
import { GenerateImageDto } from "./dto/generate-image.dto";
import { GenerateImageResponseDto } from "./dto/generate-image-response.dto";

@ApiTags("AI Image Generation")
@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("generate-image")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Generate AI images using AWS Bedrock",
    description:
      "Generate a single image using various AI models like Stable Diffusion XL and Titan Image Generator",
  })
  @ApiResponse({
    status: 200,
    description: "Image generated successfully",
    type: GenerateImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid parameters",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error - generation failed",
  })
  async generateImage(
    @Body() generateImageDto: GenerateImageDto
  ): Promise<GenerateImageResponseDto> {
    return this.aiService.generateImage(generateImageDto);
  }
}
