import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { lookup } from 'mime-types';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateExistingImages() {
  console.log('🚀 Iniciando migração de imagens existentes...\n');

  try {
    const uploadsDir = join(process.cwd(), 'uploads', 'images');
    console.log(`📂 Escaneando diretório: ${uploadsDir}\n`);

    let files: string[] = [];
    try {
      files = await readdir(uploadsDir);
    } catch (error) {
      console.error('❌ Erro ao ler diretório de uploads:', error);
      return;
    }

    console.log(`📋 Encontrados ${files.length} arquivos\n`);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const filename of files) {
      try {
        const filePath = join(uploadsDir, filename);
        const stats = await stat(filePath);

        if (!stats.isFile()) {
          console.log(`⏭️  Pulando diretório: ${filename}`);
          skipped++;
          continue;
        }

        const url = `/uploads/images/${filename}`;

        const existing = await prisma.uploadedImage.findFirst({
          where: { filename },
        });

        if (existing) {
          console.log(`✅ Já existe no DB: ${filename}`);
          skipped++;
          continue;
        }

        let companyId: string | null = null;
        let uploadedBy: string | null = null;

        const noteWithImage = await prisma.note.findFirst({
          where: { imageUrl: url, deletedAt: null },
          select: { companyId: true, userId: true },
        });

        if (noteWithImage) {
          companyId = noteWithImage.companyId;
          uploadedBy = noteWithImage.userId || null;
        }

        if (!companyId) {
          const linkWithImage = await prisma.link.findFirst({
            where: { imageUrl: url, deletedAt: null },
            select: { companyId: true, userId: true },
          });

          if (linkWithImage) {
            companyId = linkWithImage.companyId;
            uploadedBy = linkWithImage.userId || null;
          }
        }

        if (!companyId) {
          const scheduleWithImage = await prisma.uploadedSchedule.findFirst({
            where: { imageUrl: url, deletedAt: null },
            select: { companyId: true, userId: true },
          });

          if (scheduleWithImage) {
            companyId = scheduleWithImage.companyId;
            uploadedBy = scheduleWithImage.userId || null;
          }
        }

        if (!companyId) {
          const firstCompany = await prisma.company.findFirst({
            where: { status: 'ACTIVE' },
          });

          if (!firstCompany) {
            console.error(`❌ Nenhuma empresa ativa encontrada. Pulando: ${filename}`);
            errors++;
            continue;
          }

          companyId = firstCompany.id;
        }

        if (!uploadedBy) {
          const firstAdmin = await prisma.user.findFirst({
            where: {
              companyId,
              role: { in: ['SUPERADMIN', 'ADMIN'] },
              status: 'ACTIVE',
            },
          });

          if (!firstAdmin) {
            const anyUser = await prisma.user.findFirst({
              where: {
                companyId,
                status: 'ACTIVE',
              },
            });

            if (!anyUser) {
              console.error(`❌ Nenhum usuário encontrado para company ${companyId}. Pulando: ${filename}`);
              errors++;
              continue;
            }

            uploadedBy = anyUser.id;
          } else {
            uploadedBy = firstAdmin.id;
          }
        }

        const mimeType = lookup(filename) || 'application/octet-stream';
        const originalName = filename.replace(/^[a-f0-9-]+/, '').replace(/^\./g, '') || filename;

        await prisma.uploadedImage.create({
          data: {
            companyId,
            uploadedBy,
            filename,
            originalName,
            url,
            mimeType,
            size: stats.size,
            status: 'ACTIVE',
          },
        });

        console.log(`✨ Migrado: ${filename} → Company: ${companyId.substring(0, 8)}... User: ${uploadedBy.substring(0, 8)}...`);
        processed++;
      } catch (error) {
        console.error(`❌ Erro ao processar ${filename}:`, error);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migração concluída!`);
    console.log(`📊 Processados: ${processed}`);
    console.log(`⏭️  Pulados: ${skipped}`);
    console.log(`❌ Erros: ${errors}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingImages();
