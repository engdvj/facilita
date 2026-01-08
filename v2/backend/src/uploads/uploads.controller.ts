import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { imageMulterConfig, documentMulterConfig } from './config/multer.config';
import { imageFileFilter, documentFileFilter } from './filters/file-type.filter';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      ...imageMulterConfig,
      fileFilter: imageFileFilter,
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: this.uploadsService.getFileUrl(file.filename, 'images'),
    };
  }

  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      ...documentMulterConfig,
      fileFilter: documentFileFilter,
    }),
  )
  uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: this.uploadsService.getFileUrl(file.filename, 'documents'),
    };
  }
}
