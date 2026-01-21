import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    [key: string]: any;
    private readonly client;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
