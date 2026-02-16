import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfigService } from './system-config.service';
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
        isEditable: boolean;
    }[]>;
    findOne(key: string): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
        isEditable: boolean;
    }>;
    update(key: string, data: UpdateSystemConfigDto): Promise<{
        category: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        type: string;
        key: string;
        value: string;
        isEditable: boolean;
    }>;
}
