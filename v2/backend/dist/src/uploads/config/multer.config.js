"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentMulterConfig = exports.imageMulterConfig = exports.multerConfig = void 0;
const fs_1 = require("fs");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const system_config_store_1 = require("../../system-config/system-config.store");
const resolveUploadRoot = () => {
    const configured = system_config_store_1.systemConfigStore.getString('upload_directory', 'uploads');
    const value = configured.trim() || 'uploads';
    return (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(process.cwd(), value);
};
const ensureDir = (path) => {
    (0, fs_1.mkdirSync)(path, { recursive: true });
};
const createStorage = (subdir) => (0, multer_1.diskStorage)({
    destination: (_req, _file, callback) => {
        const root = resolveUploadRoot();
        const target = subdir ? (0, path_1.join)(root, subdir) : root;
        ensureDir(target);
        callback(null, target);
    },
    filename: (_req, file, callback) => {
        const uniqueName = `${(0, uuid_1.v4)()}${(0, path_1.extname)(file.originalname)}`;
        callback(null, uniqueName);
    },
});
exports.multerConfig = {
    storage: createStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
exports.imageMulterConfig = {
    storage: createStorage('images'),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
};
exports.documentMulterConfig = {
    storage: createStorage('documents'),
    limits: {
        fileSize: 20 * 1024 * 1024,
    },
};
//# sourceMappingURL=multer.config.js.map