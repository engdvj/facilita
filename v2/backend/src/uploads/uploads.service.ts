import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { isAbsolute, resolve } from 'path';
import { systemConfigStore } from '../system-config/system-config.store';

const resolveUploadRoot = () => {
  const configured = systemConfigStore.getString('upload_directory', 'uploads');
  const value = configured.trim() || 'uploads';
  return isAbsolute(value) ? value : resolve(process.cwd(), value);
};

const resolveUploadPath = (filePath: string) => {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  const trimmed = filePath.replace(/^[/\\]+/, '');
  const root = resolveUploadRoot();
  if (trimmed.startsWith('uploads/')) {
    return resolve(root, trimmed.slice('uploads/'.length));
  }
  return resolve(root, trimmed);
};

@Injectable()
export class UploadsService {
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = resolveUploadPath(filePath);
      await unlink(fullPath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  getFileUrl(filename: string, type: 'images' | 'documents' = 'documents'): string {
    return `/uploads/${type}/${filename}`;
  }
}
