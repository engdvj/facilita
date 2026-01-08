export declare class UploadsService {
    deleteFile(filePath: string): Promise<void>;
    getFileUrl(filename: string, type?: 'images' | 'documents'): string;
}
