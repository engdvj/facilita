import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient as CompanyPrismaClient } from '@prisma/client';
import { PrismaClient as UserPrismaClient } from './generated/user';
import { createPrismaAdapter } from './prisma-adapter';
import { APP_MODE } from '../common/app-mode';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  [key: string]: any;
  private readonly client: CompanyPrismaClient | UserPrismaClient;

  constructor() {
    const adapter = createPrismaAdapter();
    this.client =
      APP_MODE === 'user'
        ? new UserPrismaClient({ adapter })
        : new CompanyPrismaClient({ adapter });
    Object.assign(this, this.client);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
