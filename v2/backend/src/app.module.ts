import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { HealthModule } from './health/health.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PrismaModule } from './prisma/prisma.module';
import { SectorsModule } from './sectors/sectors.module';
import { UnitsModule } from './units/units.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { LinksModule } from './links/links.module';
import { UploadedSchedulesModule } from './uploaded-schedules/uploaded-schedules.module';
import { UploadsModule } from './uploads/uploads.module';
import { BackupsModule } from './backups/backups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CompaniesModule,
    UnitsModule,
    SectorsModule,
    PermissionsModule,
    HealthModule,
    CategoriesModule,
    LinksModule,
    UploadedSchedulesModule,
    UploadsModule,
    BackupsModule,
  ],
})
export class AppModule {}
