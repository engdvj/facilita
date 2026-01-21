export type SystemConfigSeed = {
    key: string;
    value: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'path' | 'time';
    isEditable: boolean;
    category: string;
};
export declare const SYSTEM_CONFIG_DEFAULTS: SystemConfigSeed[];
