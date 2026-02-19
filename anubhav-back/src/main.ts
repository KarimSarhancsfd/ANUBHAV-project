import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // PERF: Enable gzip/brotli compression on all responses.
  // Reduces payload size by 40-60% for JSON-heavy API responses.
  app.use(compression());

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
