import { join } from 'path';
import * as http from 'node:http';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app: NestExpressApplication =
    await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable Content Security Policy
  app.use(
    (
      _: any,
      res: import('express').Response,
      next: import('express').NextFunction,
    ) => {
      res.header(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'",
      );
      next();
    },
  );

  // Versioning with URI
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Validation pipe for all requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Timeout for requests
  const server: http.Server = app.getHttpServer();
  server.setTimeout(30 * 1000); // 30 seconds
  server.keepAliveTimeout = 60 * 1000;
  server.headersTimeout = 20 * 1000;

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('CMPC Books API')
    .setDescription('Digital Library Management System API')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Books', 'Book management endpoints')
    .addTag('Upload', 'File upload endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const configService: ConfigService = app.get(ConfigService);
  const SERVER_PORT: string = configService.get<string>('SERVER.PORT')!;
  await app.listen(parseInt(SERVER_PORT) ?? 3001);
}

void bootstrap();
