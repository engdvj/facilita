"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const system_config_store_1 = require("../system-config/system-config.store");
const resolveUploadRoot = () => {
    const configured = system_config_store_1.systemConfigStore.getString('upload_directory', 'uploads');
    const value = configured.trim() || 'uploads';
    return (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(process.cwd(), value);
};
const resolveUploadPath = (filePath) => {
    if ((0, path_1.isAbsolute)(filePath)) {
        return filePath;
    }
    const trimmed = filePath.replace(/^[/\\]+/, '');
    const root = resolveUploadRoot();
    if (trimmed.startsWith('uploads/')) {
        return (0, path_1.resolve)(root, trimmed.slice('uploads/'.length));
    }
    return (0, path_1.resolve)(root, trimmed);
};
let UploadsService = class UploadsService {
    async deleteFile(filePath) {
        try {
            const fullPath = resolveUploadPath(filePath);
            await (0, promises_1.unlink)(fullPath);
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    getFileUrl(filename, type = 'documents') {
        return `/uploads/${type}/${filename}`;
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)()
], UploadsService);
//# sourceMappingURL=uploads.service.js.map