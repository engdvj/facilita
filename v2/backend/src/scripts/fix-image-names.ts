import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixImageNames() {
  console.log('🔧 Corrigindo nomes das imagens...\n');

  try {
    const images = await prisma.uploadedImage.findMany();

    console.log(`📋 Total de imagens: ${images.length}\n`);

    let updated = 0;

    for (const image of images) {
      // Remove o UUID e mantém só a extensão como nome mais legível
      // Exemplo: abc123-def456.jpg → jpg
      // Ou podemos usar o filename completo se não houver nome melhor
      let newName = image.filename;

      // Se o originalName atual for só a extensão ou vazio, use o filename
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
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

fixImageNames();
