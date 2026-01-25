"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentFileFilter = exports.imageFileFilter = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const imageFileFilter = (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
        return callback(new common_1.BadRequestException('Only image files are allowed (JPEG, PNG, GIF, WEBP)'), false);
    }
    callback(null, true);
};
exports.imageFileFilter = imageFileFilter;
const documentFileFilter = (req, file, callback) => {
    const mimeType = typeof file?.mimetype === 'string'
        ? file.mimetype.split(';')[0].trim().toLowerCase()
        : '';
    const extension = typeof file?.originalname === 'string'
        ? (0, path_1.extname)(file.originalname).toLowerCase()
        : '';
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/markdown',
        'text/x-markdown',
    ];
    const allowedExtensions = new Set([
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.txt',
        '.md',
    ]);
    const isMimeAllowed = allowedMimes.includes(mimeType);
    const isExtensionAllowed = allowedExtensions.has(extension);
    const shouldAllowByExtension = isExtensionAllowed &&
        (!mimeType || mimeType === 'application/octet-stream');
    if (!isMimeAllowed && !shouldAllowByExtension) {
        return callback(new common_1.BadRequestException('Invalid file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, MD'), false);
    }
    callback(null, true);
};
exports.documentFileFilter = documentFileFilter;
//# sourceMappingURL=file-type.filter.js.map