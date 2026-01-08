import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (req: any, file: any, callback: any) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!allowedMimes.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Only image files are allowed (JPEG, PNG, GIF, WEBP)'),
      false,
    );
  }

  callback(null, true);
};

export const documentFileFilter = (req: any, file: any, callback: any) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];

  if (!allowedMimes.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT'),
      false,
    );
  }

  callback(null, true);
};
