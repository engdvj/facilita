import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // Create upload directories if they don't exist
  const uploadDirs = ['uploads', 'uploads/images', 'uploads/documents'];
  for (const dir of uploadDirs) {
    try {
      await mkdir(join(process.cwd(), dir), { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  // Serve static files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const corsOrigin = config.get<string>('CORS_ORIGIN');
  const allowAllOrigins =
    !corsOrigin || corsOrigin === '*' || corsOrigin === '0.0.0.0';
  const allowedOrigins = allowAllOrigins
    ? true
    : corsOrigin.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
