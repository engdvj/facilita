import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';
export declare class UploadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    deleteFile(filePath: string): Promise<void>;
    getFileUrl(filename: string, type?: 'images' | 'documents'): string;
    createImageRecord(dto: CreateImageDto): Promise<{
        url: string;
        id: string;
        status: import(".prisma/client").$Enums.EntityStatus;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        deletedAt: Date | null;
        uploadedBy: string;
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        width: number | null;
        height: number | null;
        alt: string | null;
        tags: string[];
    }>;
    listImages(query: QueryImagesDto): Promise<{
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
            deletedAt: Date | null;
            uploadedBy: string;
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
    getImageById(id: string): Promise<{
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
        deletedAt: Date | null;
        uploadedBy: string;
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
        deletedAt: Date | null;
        uploadedBy: string;
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
    getImageUsageCount(imageUrl: string): Promise<number>;
    canDeleteImage(imageUrl: string): Promise<boolean>;
}
