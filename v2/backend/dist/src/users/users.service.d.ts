import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): any;
    findByUsername(username: string): any;
    findById(id: string): any;
    findActiveById(id: string): any;
    findAll(): any;
    findOne(id: string): Promise<any>;
    create(data: CreateUserDto): Promise<any>;
    update(id: string, data: UpdateUserDto): Promise<any>;
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
    private ensureCompanyId;
}
