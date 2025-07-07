import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class S3Service {
  private s3: S3;
  private bucketName: string;
  private cloudFrontUrl: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get<string>("AWS_SECRET_ACCESS_KEY"),
      region: this.configService.get<string>("AWS_REGION"),
    });
    this.bucketName = this.configService.get<string>("AWS_BUCKET_NAME");
    this.cloudFrontUrl = this.configService.get<string>("CLOUDFRONT_URL");
  }

  async uploadFrameImage(
    imageBuffer: Buffer,
    fileName: string,
    orderId: string,
    itemIndex: number
  ): Promise<string> {
    try {
      const fileExtension = fileName.split(".").pop();
      const key = `frames/${orderId}/item-${itemIndex}/${uuidv4()}.${fileExtension}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: imageBuffer,
        ContentType: this.getContentType(fileExtension),
        ACL: "public-read",
      };

      const result = await this.s3.upload(uploadParams).promise();

      // Return CloudFront URL if available, otherwise S3 URL
      return this.cloudFrontUrl
        ? `${this.cloudFrontUrl}/${key}`
        : result.Location;
    } catch (error) {
      throw new BadRequestException(`S3 upload failed: ${error.message}`);
    }
  }

  async uploadMultipleFrameImages(
    images: Array<{ buffer: Buffer; fileName: string }>,
    orderId: string
  ): Promise<string[]> {
    try {
      const uploadPromises = images.map((image, index) =>
        this.uploadFrameImage(image.buffer, image.fileName, orderId, index)
      );
      return Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(
        `Multiple S3 upload failed: ${error.message}`
      );
    }
  }

  async deleteFrameImage(key: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();
    } catch (error) {
      throw new BadRequestException(`S3 delete failed: ${error.message}`);
    }
  }

  private getContentType(extension: string): string {
    const contentTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return contentTypes[extension?.toLowerCase()] || "image/jpeg";
  }

  // Helper method to extract S3 key from CloudFront or S3 URL
  extractKeyFromUrl(url: string): string {
    if (url.includes(this.cloudFrontUrl)) {
      return url.replace(`${this.cloudFrontUrl}/`, "");
    }
    // Extract key from S3 URL format
    const urlParts = url.split("/");
    return urlParts.slice(3).join("/");
  }
}
