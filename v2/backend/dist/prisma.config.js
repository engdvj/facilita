"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const config_1 = require("prisma/config");
(0, dotenv_1.config)();
exports.default = (0, config_1.defineConfig)({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: (0, config_1.env)('DATABASE_URL'),
    },
    migrations: {
        seed: 'ts-node --compiler-options {"module":"commonjs"} prisma/seed.ts',
    },
});
//# sourceMappingURL=prisma.config.js.map