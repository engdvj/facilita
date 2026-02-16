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
    listImages(query: QueryImagesDto): Promise<{
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
    getImageById(id: string): Promise<{
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
    getImageUsageCount(imageUrl: string): Promise<number>;
    canDeleteImage(imageUrl: string): Promise<boolean>;
}
