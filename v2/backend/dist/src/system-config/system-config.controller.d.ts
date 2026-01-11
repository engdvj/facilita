import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SystemConfigService } from './system-config.service';
export declare class SystemConfigController {
    private readonly systemConfigService;
    constructor(systemConfigService: SystemConfigService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
        type: string;
        isEditable: boolean;
        category: string | null;
    }[]>;
    findOne(key: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
        type: string;
        isEditable: boolean;
        category: string | null;
    }>;
    update(key: string, data: UpdateSystemConfigDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        value: string;
        description: string | null;
        type: string;
        isEditable: boolean;
        category: string | null;
    }>;
}
