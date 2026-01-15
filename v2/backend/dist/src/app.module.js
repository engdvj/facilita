"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const companies_module_1 = require("./companies/companies.module");
const health_module_1 = require("./health/health.module");
const permissions_module_1 = require("./permissions/permissions.module");
const prisma_module_1 = require("./prisma/prisma.module");
const sectors_module_1 = require("./sectors/sectors.module");
const units_module_1 = require("./units/units.module");
const users_module_1 = require("./users/users.module");
const categories_module_1 = require("./categories/categories.module");
const links_module_1 = require("./links/links.module");
const uploaded_schedules_module_1 = require("./uploaded-schedules/uploaded-schedules.module");
const notes_module_1 = require("./notes/notes.module");
const uploads_module_1 = require("./uploads/uploads.module");
const backups_module_1 = require("./backups/backups.module");
const resets_module_1 = require("./resets/resets.module");
const favorites_module_1 = require("./favorites/favorites.module");
const system_config_module_1 = require("./system-config/system-config.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            units_module_1.UnitsModule,
            sectors_module_1.SectorsModule,
            permissions_module_1.PermissionsModule,
            health_module_1.HealthModule,
            categories_module_1.CategoriesModule,
            links_module_1.LinksModule,
            uploaded_schedules_module_1.UploadedSchedulesModule,
            notes_module_1.NotesModule,
            uploads_module_1.UploadsModule,
            backups_module_1.BackupsModule,
            resets_module_1.ResetsModule,
            favorites_module_1.FavoritesModule,
            system_config_module_1.SystemConfigModule,
            notifications_module_1.NotificationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map