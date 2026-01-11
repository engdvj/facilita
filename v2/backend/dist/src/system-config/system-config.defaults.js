"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SYSTEM_CONFIG_DEFAULTS = void 0;
const today = new Date().toISOString().slice(0, 10);
exports.SYSTEM_CONFIG_DEFAULTS = [
    {
        key: 'backup_directory',
        value: 'backups/auto',
        description: 'Diretorio padrao para backups automaticos.',
        type: 'path',
        isEditable: true,
        category: 'backup',
    },
    {
        key: 'backup_schedule_enabled',
        value: 'false',
        description: 'Ativa o backup automatico diario.',
        type: 'boolean',
        isEditable: true,
        category: 'backup',
    },
    {
        key: 'backup_schedule_time',
        value: '02:00',
        description: 'Horario do backup automatico (HH:MM).',
        type: 'time',
        isEditable: true,
        category: 'backup',
    },
    {
        key: 'backup_retention_days',
        value: '7',
        description: 'Dias de retencao dos backups automaticos.',
        type: 'number',
        isEditable: true,
        category: 'backup',
    },
    {
        key: 'upload_directory',
        value: 'uploads',
        description: 'Diretorio base de uploads.',
        type: 'path',
        isEditable: true,
        category: 'storage',
    },
    {
        key: 'export_directory',
        value: 'exports',
        description: 'Diretorio padrao para exportacoes.',
        type: 'path',
        isEditable: true,
        category: 'storage',
    },
    {
        key: 'install_date',
        value: today,
        description: 'Data de instalacao.',
        type: 'string',
        isEditable: false,
        category: 'system',
    },
    {
        key: 'app_version',
        value: 'v2',
        description: 'Versao instalada do sistema.',
        type: 'string',
        isEditable: false,
        category: 'system',
    },
];
//# sourceMappingURL=system-config.defaults.js.map