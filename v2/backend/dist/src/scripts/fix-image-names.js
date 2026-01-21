"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function fixImageNames() {
    console.log('🔧 Corrigindo nomes das imagens...\n');
    try {
        const images = await prisma.uploadedImage.findMany();
        console.log(`📋 Total de imagens: ${images.length}\n`);
        let updated = 0;
        for (const image of images) {
            let newName = image.filename;
            if (!image.originalName || image.originalName.match(/^\.(jpg|jpeg|png|webp|gif)$/i)) {
                newName = image.filename;
            }
            if (newName !== image.originalName) {
                await prisma.uploadedImage.update({
                    where: { id: image.id },
                    data: { originalName: newName },
                });
                console.log(`✨ Atualizado: ${image.originalName} → ${newName}`);
                updated++;
            }
        }
        console.log('\n' + '='.repeat(60));
        console.log(`✅ Correção concluída!`);
        console.log(`📊 Atualizados: ${updated}`);
        console.log('='.repeat(60) + '\n');
    }
    catch (error) {
        console.error('❌ Erro:', error);
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
fixImageNames();
//# sourceMappingURL=fix-image-names.js.map