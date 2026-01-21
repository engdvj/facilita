import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BackupsModule } from './backups/backups.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoritesModule } from './favorites/favorites.module';
import { HealthModule } from './health/health.module';
import { LinksModule } from './links/links.module';
import { NotesModule } from './notes/notes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResetsModule } from './resets/resets.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { UploadedSchedulesModule } from './uploaded-schedules/uploaded-schedules.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    PermissionsModule,
    HealthModule,
    CategoriesModule,
    LinksModule,
    UploadedSchedulesModule,
    NotesModule,
    UploadsModule,
    BackupsModule,
    BootstrapModule,
    ResetsModule,
    FavoritesModule,
    SystemConfigModule,
    NotificationsModule,
  ],
})
export class AppUserModule {}
