"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const cookieParser = require("cookie-parser");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const uploadDirs = ['uploads', 'uploads/images', 'uploads/documents'];
    for (const dir of uploadDirs) {
        try {
            await (0, promises_1.mkdir)((0, path_1.join)(process.cwd(), dir), { recursive: true });
        }
        catch (error) {
        }
    }
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    const corsOrigin = config.get('CORS_ORIGIN');
    const allowAllOrigins = !corsOrigin || corsOrigin === '*' || corsOrigin === '0.0.0.0';
    const allowedOrigins = allowAllOrigins
        ? true
        : corsOrigin.split(',').map((origin) => origin.trim());
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
    });
    const port = config.get('PORT') ?? 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map