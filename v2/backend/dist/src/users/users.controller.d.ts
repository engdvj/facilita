import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(companyId?: string, sectorId?: string, page?: string, pageSize?: string, search?: string, res?: Response): Promise<any>;
    findAccessItems(id: string, sectorId?: string, page?: string, pageSize?: string, res?: Response): Promise<any[]>;
    findOne(id: string): Promise<any>;
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
    create(data: CreateUserDto): Promise<any>;
    updateMe(user: {
        id: string;
    }, data: UpdateProfileDto): Promise<any>;
    update(id: string, data: UpdateUserDto): Promise<any>;
    remove(id: string): Promise<any>;
}
