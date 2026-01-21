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

async function checkImages() {
  console.log('🔍 Verificando imagens no banco de dados...\n');

  try {
    const images = await prisma.uploadedImage.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const total = await prisma.uploadedImage.count();

    console.log(`📊 Total de imagens: ${total}`);
    console.log(`\n📋 Primeiras 5 imagens:\n`);

    images.forEach((img) => {
      console.log(`- ${img.originalName}`);
      console.log(`  ID: ${img.id}`);
      console.log(`  Company: ${img.companyId}`);
      console.log(`  URL: ${img.url}`);
      console.log(`  Uploaded by: ${img.user?.name || 'Unknown'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkImages();
