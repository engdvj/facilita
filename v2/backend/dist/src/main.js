"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const cookieParser = require("cookie-parser");
const express = require("express");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const app_module_1 = require("./app.module");
const system_config_service_1 = require("./system-config/system-config.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const systemConfigService = app.get(system_config_service_1.SystemConfigService);
    await systemConfigService.syncStore();
    const uploadRoot = systemConfigService.resolvePath('upload_directory', 'uploads');
    const uploadDirs = [
        uploadRoot,
        (0, path_1.join)(uploadRoot, 'images'),
        (0, path_1.join)(uploadRoot, 'documents'),
    ];
    for (const dir of uploadDirs) {
        try {
            await (0, promises_1.mkdir)(dir, { recursive: true });
        }
        catch (error) {
        }
    }
    app.use('/uploads', (req, res, next) => {
        const root = systemConfigService.resolvePath('upload_directory', 'uploads');
        return express.static(root)(req, res, next);
    });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const corsOrigin = config.get('CORS_ORIGIN');
    const allowAllOrigins = !corsOrigin || corsOrigin === '*' || corsOrigin === '0.0.0.0';
    app.enableCors({
        origin: allowAllOrigins
            ? (origin, callback) => {
                callback(null, true);
            }
            : corsOrigin.split(',').map((origin) => origin.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    });
    const port = config.get('PORT') ?? 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map