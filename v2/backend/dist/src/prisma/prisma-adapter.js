"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrismaAdapter = createPrismaAdapter;
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const app_mode_1 = require("../common/app-mode");
let pool = null;
function createPrismaAdapter() {
    const fallbackUrl = process.env.DATABASE_URL;
    const connectionString = (0, app_mode_1.isUserMode)()
        ? process.env.DATABASE_URL_USER || fallbackUrl
        : process.env.DATABASE_URL_COMPANY || fallbackUrl;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }
    if (!pool) {
        pool = new pg_1.Pool({ connectionString });
    }
    return new adapter_pg_1.PrismaPg(pool);
}
//# sourceMappingURL=prisma-adapter.js.map