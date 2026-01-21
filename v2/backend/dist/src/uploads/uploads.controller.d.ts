import { UploadsService } from './uploads.service';
import { QueryImagesDto } from './dto/query-images.dto';
import { UpdateImageDto } from './dto/update-image.dto';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadImage(file: Express.Multer.File, req: any, companyIdParam?: string): Promise<any>;
    listImages(query: QueryImagesDto, req: any): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getImage(id: string): Promise<any>;
    updateImage(id: string, dto: UpdateImageDto): Promise<any>;
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
