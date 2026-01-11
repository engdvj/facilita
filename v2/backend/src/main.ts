import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { AppModule } from './app.module';
import { SystemConfigService } from './system-config/system-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const systemConfigService = app.get(SystemConfigService);

  await systemConfigService.syncStore();

  // Create upload directories if they don't exist
  const uploadRoot = systemConfigService.resolvePath(
    'upload_directory',
    'uploads',
  );
  const uploadDirs = [
    uploadRoot,
    join(uploadRoot, 'images'),
    join(uploadRoot, 'documents'),
  ];
  for (const dir of uploadDirs) {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  // Serve static files (allowing dynamic upload directory changes)
  app.use('/uploads', (req: any, res: any, next: any) => {
    const root = systemConfigService.resolvePath(
      'upload_directory',
      'uploads',
    );
    return express.static(root)(req, res, next);
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

  app.enableCors({
    origin: allowAllOrigins
      ? (origin, callback) => {
          // Allow all origins when configured
          callback(null, true);
        }
      : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  const port = config.get<number>('PORT') ?? 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
