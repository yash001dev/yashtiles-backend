import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { GenerateImageDto } from "./dto/generate-image.dto";
import { GenerateImageResponseDto } from "./dto/generate-image-response.dto";

@Injectable()
export class AiService {
  private bedrockClient: BedrockRuntimeClient;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>("AWS_REGION");
    const accessKeyId = this.configService.get<string>("AWS_BEDROCK_API_KEY");
    const secretAccessKey = this.configService.get<string>(
      "AWS_BEDROCK_ACCESS_KEY"
    );

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "AWS credentials not properly configured. Please check AWS_REGION, AWS_BEDROCK_API_KEY, and AWS_BEDROCK_ACCESS_KEY environment variables."
      );
    }

    this.bedrockClient = new BedrockRuntimeClient({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  async generateImage(
    generateImageDto: GenerateImageDto
  ): Promise<GenerateImageResponseDto> {
    const startTime = Date.now();

    try {
      const imageResult = await this.generateSingleImage(generateImageDto);
      const generationTime = Date.now() - startTime;

      return {
        success: true,
        imageData: imageResult.imageData,
        generationTime,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Image generation failed: ${error.message}`
      );
    }
  }

  private async generateSingleImage(
    generateImageDto: GenerateImageDto
  ): Promise<{ imageData: string }> {
    const prompt = this.buildPrompt(generateImageDto);
    const seed = Math.floor(Math.random() * 2147483647);

    // Different request format for different models
    let requestBody;

    if (generateImageDto.model.includes("stability")) {
      // Stable Diffusion format
      requestBody = {
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          ...(generateImageDto.negativePrompt
            ? [
                {
                  text: generateImageDto.negativePrompt,
                  weight: -1,
                },
              ]
            : []),
        ],
        cfg_scale: generateImageDto.guidanceScale,
        height: generateImageDto.height,
        width: generateImageDto.width,
        samples: 1,
        steps: generateImageDto.steps,
        seed: seed,
      };
    } else {
      // Titan Image Generator format - based on AWS Go documentation
      requestBody = {
        taskType: "TEXT_IMAGE",
        textToImageParams: {
          text: prompt,
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          quality: "standard",
          cfgScale: generateImageDto.guidanceScale,
          height: generateImageDto.height,
          width: generateImageDto.width,
          seed: seed,
        },
      };
    }

    const command = new InvokeModelCommand({
      modelId: generateImageDto.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(requestBody),
    });

    // Debug logging
    console.log("Model ID:", generateImageDto.model);
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await this.bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      // Debug logging
      console.log("Response Body:", JSON.stringify(responseBody, null, 2));

      let imageData;

      if (generateImageDto.model.includes("stability")) {
        // Stable Diffusion response format
        if (responseBody.artifacts && responseBody.artifacts.length > 0) {
          imageData = responseBody.artifacts[0].base64;
        } else {
          throw new Error("No image generated from Stable Diffusion");
        }
      } else {
        // Titan Image Generator response format
        if (responseBody.images && responseBody.images.length > 0) {
          imageData = responseBody.images[0];
        } else {
          throw new Error("No image generated from Titan");
        }
      }

      return {
        imageData: `data:image/png;base64,${imageData}`,
      };
    } catch (error) {
      console.error("Bedrock API Error:", error);

      if (
        error.name === "UnauthorizedOperation" ||
        error.name === "AccessDenied"
      ) {
        throw new BadRequestException(
          `AWS credentials error: Please check your AWS credentials and Bedrock permissions. Error: ${error.message}`
        );
      } else if (error.name === "ValidationException") {
        throw new BadRequestException(
          `Invalid request parameters: ${error.message}`
        );
      } else if (error.name === "ThrottlingException") {
        throw new BadRequestException(`Rate limit exceeded: ${error.message}`);
      } else {
        throw new BadRequestException(`Bedrock API error: ${error.message}`);
      }
    }
  }

  private buildPrompt(generateImageDto: GenerateImageDto): string {
    let prompt = generateImageDto.prompt;

    // Add style if specified
    if (generateImageDto.style) {
      prompt += `, ${generateImageDto.style} style`;
    }

    // For Titan, we can include negative prompts in the main prompt
    // since Titan doesn't support separate negative prompts
    if (
      generateImageDto.negativePrompt &&
      !generateImageDto.model.includes("stability")
    ) {
      prompt += `. Avoid: ${generateImageDto.negativePrompt}`;
    }

    return prompt;
  }
}
