import { UploadsService } from './uploads.service';
import { QueryImagesDto } from './dto/query-images.dto';
import { UpdateImageDto } from './dto/update-image.dto';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadImage(file: Express.Multer.File, req: any, companyIdParam?: string): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        uploadedBy: string;
        deletedAt: Date | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
    }>;
    listImages(query: QueryImagesDto, req: any): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
                avatarUrl: string | null;
            };
        } & {
            url: string;
            id: string;
            status: import(".prisma/client").$Enums.EntityStatus;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            uploadedBy: string;
            deletedAt: Date | null;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            alt: string | null;
            tags: string[];
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getImage(id: string): Promise<{
        usageCount: number;
        user: {
            id: string;
            name: string;
            email: string;
            avatarUrl: string | null;
        };
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        uploadedBy: string;
        deletedAt: Date | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
    }>;
    updateImage(id: string, dto: UpdateImageDto): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        uploadedBy: string;
        deletedAt: Date | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
    }>;
    deleteImage(id: string): Promise<{
        message: string;
    }>;
    uploadDocument(file: Express.Multer.File): {
        filename: string;
        originalName: string;
        size: number;
        url: string;
    };
}
