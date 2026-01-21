import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
export declare class LinksController {
    private readonly linksService;
    constructor(linksService: LinksService);
    create(createLinkDto: CreateLinkDto, req: any): Promise<any>;
    findAll(companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findAllAdmin(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findAllAdminAlias(req: any, companyId?: string, sectorId?: string, unitId?: string, categoryId?: string, isPublic?: string, audience?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateLinkDto: UpdateLinkDto, req: any): Promise<any>;
    remove(id: string, body: {
        adminMessage?: string;
    } | undefined, req: any): Promise<any>;
    restore(id: string): Promise<any>;
    activate(id: string, req: any): Promise<any>;
    deactivate(id: string, req: any): Promise<any>;
}
