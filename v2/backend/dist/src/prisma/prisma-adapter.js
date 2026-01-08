"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrismaAdapter = createPrismaAdapter;
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
let pool = null;
function createPrismaAdapter() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set');
    }
    if (!pool) {
        pool = new pg_1.Pool({ connectionString });
    }
    return new adapter_pg_1.PrismaPg(pool);
}
//# sourceMappingURL=prisma-adapter.js.map