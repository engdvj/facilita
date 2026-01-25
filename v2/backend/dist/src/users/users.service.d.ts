import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): any;
    findByUsername(username: string): any;
    findById(id: string): any;
    findActiveById(id: string): any;
    findAll(options?: {
        companyId?: string;
        sectorId?: string;
        search?: string;
        skip?: number;
        take?: number;
    }): Promise<{
        items: any;
        total: any;
    }>;
    findOne(id: string): Promise<any>;
    create(data: CreateUserDto): Promise<any>;
    update(id: string, data: UpdateUserDto): Promise<any>;
    updateProfile(id: string, data: UpdateProfileDto): Promise<any>;
    getDependencies(id: string): Promise<{
        sectors: any;
        links: any;
        schedules: any;
        notes: any;
        uploadedImages: any;
        linkVersions: any;
        favorites: any;
        refreshTokens: any;
        activityLogs: any;
        auditLogs: any;
        hasAny: boolean;
    }>;
    remove(id: string): Promise<any>;
    getAccessItems(userId: string, options?: {
        sectorId?: string;
        page?: number;
        pageSize?: number;
        shouldPaginate?: boolean;
    }): Promise<{
        items: any[];
        total: number;
    }>;
    private ensureCompanyId;
    private getUserUnitsBySector;
    private resolveUnitIds;
    private resolveAudience;
    private canUserAccessItem;
    private normalizeUnitIds;
    private buildUserSectorUnits;
    private assertUserSectorUnits;
}
