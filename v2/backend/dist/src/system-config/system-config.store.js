"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConfigPath = exports.systemConfigStore = void 0;
const path_1 = require("path");
const system_config_defaults_1 = require("./system-config.defaults");
const buildDefaults = () => system_config_defaults_1.SYSTEM_CONFIG_DEFAULTS.reduce((acc, entry) => {
    acc[entry.key] = entry.value;
    return acc;
}, {});
const store = new Map(Object.entries(buildDefaults()));
exports.systemConfigStore = {
    get(key) {
        return store.get(key);
    },
    set(key, value) {
        store.set(key, value);
    },
    hydrate(entries) {
        store.clear();
        const defaults = buildDefaults();
        Object.entries(defaults).forEach(([key, value]) => {
            store.set(key, value);
        });
        entries.forEach((entry) => {
            if (entry.key) {
                store.set(entry.key, entry.value);
            }
        });
    },
    getString(key, fallback) {
        return store.get(key) ?? fallback;
    },
    getBoolean(key, fallback) {
        const value = store.get(key);
        if (value === undefined)
            return fallback;
        return value === 'true';
    },
    getNumber(key, fallback) {
        const value = store.get(key);
        if (value === undefined)
            return fallback;
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    },
};
const resolveConfigPath = (key, fallback) => {
    const value = exports.systemConfigStore.getString(key, fallback).trim();
    if (!value) {
        return (0, path_1.resolve)(process.cwd(), fallback);
    }
    return (0, path_1.isAbsolute)(value) ? value : (0, path_1.resolve)(process.cwd(), value);
};
exports.resolveConfigPath = resolveConfigPath;
//# sourceMappingURL=system-config.store.js.map