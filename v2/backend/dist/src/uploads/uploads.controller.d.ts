import { UploadsService } from './uploads.service';
import { QueryImagesDto } from './dto/query-images.dto';
import { UpdateImageDto } from './dto/update-image.dto';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadImage(file: Express.Multer.File, req: any): Promise<{
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        deletedAt: Date | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
        uploadedBy: string;
    }>;
    listImages(query: QueryImagesDto, req: any): Promise<{
        data: ({
            user: {
                name: string;
                avatarUrl: string | null;
                id: string;
                email: string;
            };
        } & {
            status: import(".prisma/client").$Enums.EntityStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            url: string;
            deletedAt: Date | null;
            filename: string;
            originalName: string;
            mimeType: string;
            size: number;
            width: number | null;
            height: number | null;
            alt: string | null;
            tags: string[];
            uploadedBy: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getImage(id: string): Promise<{
        usageCount: number;
        user: {
            name: string;
            avatarUrl: string | null;
            id: string;
            email: string;
        };
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        deletedAt: Date | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
        uploadedBy: string;
    }>;
    updateImage(id: string, dto: UpdateImageDto): Promise<{
        status: import(".prisma/client").$Enums.EntityStatus;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        url: string;
        deletedAt: Date | null;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
        uploadedBy: string;
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
