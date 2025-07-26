import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://stage.photoframix.com"
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });
  const configService = app.get(ConfigService);

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, "..", "public"));

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // API prefix
  app.setGlobalPrefix("api/v1");

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Photoframix API")
    .setDescription("Custom Photo Frame Backend API Documentation")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .addCookieAuth("refresh_token", {
      type: "apiKey",
      in: "cookie",
      name: "refresh_token",
    })
    .addTag("Authentication", "User authentication endpoints")
    .addTag("Users", "User management endpoints")
    .addTag("Orders", "Order management endpoints")
    .addTag("Products", "Product management endpoints")
    .addTag("Payments", "Payment processing endpoints")
    .addTag("Admin", "Admin panel endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get("PORT") || 3000;
  await app.listen(port, "0.0.0.0");
  //For Checking health endpoint
  console.log(`🌟 Photoframix API is running on port: ${port}`);
  console.log(`🚀 Photoframix API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
