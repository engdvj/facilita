type SystemConfigValue = {
    key: string;
    value: string;
};
export declare const systemConfigStore: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    hydrate(entries: SystemConfigValue[]): void;
    getString(key: string, fallback: string): string;
    getBoolean(key: string, fallback: boolean): boolean;
    getNumber(key: string, fallback: number): number;
};
export declare const resolveConfigPath: (key: string, fallback: string) => string;
export {};
