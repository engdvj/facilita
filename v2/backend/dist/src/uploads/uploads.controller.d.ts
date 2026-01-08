import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadImage(file: Express.Multer.File): {
        filename: string;
        originalName: string;
        size: number;
        url: string;
    };
    uploadDocument(file: Express.Multer.File): {
        filename: string;
        originalName: string;
        size: number;
        url: string;
    };
}
