import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UploadsService {
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = join(process.cwd(), filePath);
      await unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filename: string, type: 'images' | 'documents' = 'documents'): string {
    return `/uploads/${type}/${filename}`;
  }
}
