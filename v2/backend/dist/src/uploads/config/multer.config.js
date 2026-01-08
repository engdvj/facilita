"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentMulterConfig = exports.imageMulterConfig = exports.multerConfig = void 0;
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
exports.multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads',
        filename: (req, file, callback) => {
            const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
            callback(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
exports.imageMulterConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/images',
        filename: (req, file, callback) => {
            const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
            callback(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
exports.documentMulterConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: './uploads/documents',
        filename: (req, file, callback) => {
            const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
            callback(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map