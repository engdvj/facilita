import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { LinksModule } from './links/links.module';
import { UploadedSchedulesModule } from './uploaded-schedules/uploaded-schedules.module';
import { NotesModule } from './notes/notes.module';
import { UploadsModule } from './uploads/uploads.module';
import { BackupsModule } from './backups/backups.module';
import { BootstrapModule } from './bootstrap/bootstrap.module';
import { ResetsModule } from './resets/resets.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PublicModule } from './public/public.module';
import { SharesModule } from './shares/shares.module';

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
    PublicModule,
    SharesModule,
  ],
})
export class AppModule {}
