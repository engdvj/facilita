"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const prisma_service_1 = require("../prisma/prisma.service");
const system_config_defaults_1 = require("./system-config.defaults");
const system_config_store_1 = require("./system-config.store");
const findDefault = (key) => system_config_defaults_1.SYSTEM_CONFIG_DEFAULTS.find((entry) => entry.key === key);
let SystemConfigService = class SystemConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.syncStore();
    }
    async syncStore() {
        try {
            const configs = await this.prisma.systemConfig.findMany({
                select: { key: true, value: true },
            });
            system_config_store_1.systemConfigStore.hydrate(configs);
        }
        catch (error) {
            console.warn('Falha ao carregar SystemConfig, usando defaults.', error);
        }
    }
    findAll() {
        return this.prisma.systemConfig.findMany({
            orderBy: [{ category: 'asc' }, { key: 'asc' }],
        });
    }
    async findOne(key) {
        const config = await this.prisma.systemConfig.findUnique({ where: { key } });
        if (!config) {
            throw new common_1.NotFoundException('Configuracao nao encontrada.');
        }
        return config;
    }
    async update(key, data) {
        const config = await this.prisma.systemConfig.findUnique({ where: { key } });
        if (!config) {
            throw new common_1.NotFoundException('Configuracao nao encontrada.');
        }
        if (!config.isEditable) {
            throw new common_1.BadRequestException('Configuracao nao editavel.');
        }
        const normalizedValue = await this.normalizeValue(config, data.value);
        const updated = await this.prisma.systemConfig.update({
            where: { key },
            data: { value: normalizedValue },
        });
        system_config_store_1.systemConfigStore.set(updated.key, updated.value);
        return updated;
    }
    resolvePath(key, fallback) {
        const entry = system_config_store_1.systemConfigStore.get(key);
        const value = (entry ?? fallback).trim();
        if (!value) {
            return (0, path_1.resolve)(process.cwd(), fallback);
        }
        return (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(process.cwd(), value);
    }
    getBoolean(key, fallback) {
        return system_config_store_1.systemConfigStore.getBoolean(key, fallback);
    }
    getNumber(key, fallback) {
        return system_config_store_1.systemConfigStore.getNumber(key, fallback);
    }
    getString(key, fallback) {
        return system_config_store_1.systemConfigStore.getString(key, fallback);
    }
    async normalizeValue(config, input) {
        switch (config.type) {
            case 'boolean':
                return this.normalizeBoolean(input);
            case 'number':
                return this.normalizeNumber(input);
            case 'time':
                return this.normalizeTime(input);
            case 'path':
                return this.normalizePath(input);
            default:
                return this.normalizeString(input, config.key);
        }
    }
    normalizeBoolean(input) {
        if (typeof input === 'boolean') {
            return input ? 'true' : 'false';
        }
        if (typeof input === 'string') {
            const value = input.trim().toLowerCase();
            if (value === 'true' || value === 'false') {
                return value;
            }
        }
        throw new common_1.BadRequestException('Valor booleano invalido.');
    }
    normalizeNumber(input) {
        const parsed = typeof input === 'number' ? input : Number(String(input).trim());
        if (!Number.isFinite(parsed)) {
            throw new common_1.BadRequestException('Valor numerico invalido.');
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException('Valor numerico deve ser positivo.');
        }
        return String(Math.floor(parsed));
    }
    normalizeTime(input) {
        const value = String(input ?? '').trim();
        const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;
        if (!pattern.test(value)) {
            throw new common_1.BadRequestException('Horario invalido. Use HH:MM.');
        }
        return value;
    }
    async normalizePath(input) {
        const value = String(input ?? '').trim();
        if (!value) {
            throw new common_1.BadRequestException('Diretorio invalido.');
        }
        const resolved = (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(process.cwd(), value);
        await (0, promises_1.mkdir)(resolved, { recursive: true });
        return value;
    }
    normalizeString(input, key) {
        const value = String(input ?? '').trim();
        if (!value) {
            const fallback = findDefault(key)?.value;
            if (fallback) {
                return fallback;
            }
            throw new common_1.BadRequestException('Valor invalido.');
        }
        return value;
    }
};
exports.SystemConfigService = SystemConfigService;
exports.SystemConfigService = SystemConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemConfigService);
//# sourceMappingURL=system-config.service.js.map