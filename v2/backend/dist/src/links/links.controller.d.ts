import { Response } from 'express';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { PermissionsService } from '../permissions/permissions.service';
export declare class LinksController {
    private readonly linksService;
    private readonly permissionsService;
    constructor(linksService: LinksService, permissionsService: PermissionsService);
    create(createLinkDto: CreateLinkDto, req: any): Promise<any>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, req?: any): Promise<any>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, search?: string, page?: string, pageSize?: string, res?: Response): Promise<any>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string, search?: string, page?: string, pageSize?: string, res?: Response): Promise<any>;
    findOne(id: string, req?: any): Promise<any>;
    update(id: string, updateLinkDto: UpdateLinkDto, req: any): Promise<any>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<any>;
    restore(id: string, req: any): Promise<any>;
    activate(id: string, req: any): Promise<any>;
    deactivate(id: string, req: any): Promise<any>;
    private getAccessContext;
}
