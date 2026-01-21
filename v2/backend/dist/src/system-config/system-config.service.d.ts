import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
export declare class SystemConfigService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    syncStore(): Promise<void>;
    findAll(): any;
    findOne(key: string): Promise<any>;
    update(key: string, data: UpdateSystemConfigDto): Promise<any>;
    resolvePath(key: string, fallback: string): string;
    getBoolean(key: string, fallback: boolean): boolean;
    getNumber(key: string, fallback: number): number;
    getString(key: string, fallback: string): string;
    private normalizeValue;
    private normalizeBoolean;
    private normalizeNumber;
    private normalizeTime;
    private normalizePath;
    private normalizeString;
}
