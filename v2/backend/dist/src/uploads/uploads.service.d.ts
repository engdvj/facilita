import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { QueryImagesDto } from './dto/query-images.dto';
export declare class UploadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    deleteFile(filePath: string): Promise<void>;
    getFileUrl(filename: string, type?: 'images' | 'documents'): string;
    createImageRecord(dto: CreateImageDto): Promise<any>;
    listImages(query: QueryImagesDto): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getImageById(id: string): Promise<any>;
    updateImage(id: string, dto: UpdateImageDto): Promise<any>;
    deleteImage(id: string): Promise<{
        message: string;
    }>;
    getImageUsageCount(imageUrl: string): Promise<number>;
    canDeleteImage(imageUrl: string): Promise<boolean>;
}
