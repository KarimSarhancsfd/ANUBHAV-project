/**
 * @file main.ts
 * @description Application bootstrap and configuration entry point.
 * Initializes NestJS application with middleware, security, CORS, validation, and Swagger documentation.
 */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * @function bootstrap
 * @description Initializes and starts the NestJS application.
 * Configures global middleware, security headers, CORS, request validation,
 * exception handling, and Swagger API documentation.
 * @async
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // PERF: Enable gzip/brotli compression on all responses.
  app.use(compression());

  // SECURITY: Set security-related HTTP headers.
  // Protects against common vulnerabilities like XSS, Clickjacking, etc.
  app.use(helmet({
    contentSecurityPolicy: false, // Set to false to avoid breaking Swagger/Angular in hybrid environments
    crossOriginEmbedderPolicy: false,
  }));

  // PERF: CORS — keep origin:true for broad dev compatibility.
  // In production, replace with explicit allowed origin(s) for security.
  app.enableCors({
    origin: true,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    credentials: true,
  });

  // PERF: ValidationPipe — forbidNonWhitelisted strips/rejects unknown
  // request fields early, reducing downstream serialization work.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // PERF: reject unknown payload fields immediately
    }),
  );

  // STABILITY: Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('ANUBHAV Gaming Studio API')
    .setDescription('API documentation for ANUBHAV Gaming Studio backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application running on port ${port}`);
}
bootstrap();
