import { ApiProperty } from "@nestjs/swagger";

export class GenerateImageResponseDto {
  @ApiProperty({
    description: "Success status",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Base64 encoded image data",
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  })
  imageData: string;

  @ApiProperty({
    description: "Generation time in milliseconds",
    example: 15000,
  })
  generationTime: number;
}
