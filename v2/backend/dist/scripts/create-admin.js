"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma_adapter_1 = require("../src/prisma/prisma-adapter");
const prisma = new client_1.PrismaClient({ adapter: (0, prisma_adapter_1.createPrismaAdapter)() });
async function main() {
    const email = 'admin';
    const password = 'admin123';
    const name = 'Admin';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log('Admin user already exists:', existing.id);
        return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: client_1.UserRole.ADMIN,
            status: client_1.UserStatus.ACTIVE,
        },
    });
    console.log('Admin user created:', user.id);
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create-admin.js.map