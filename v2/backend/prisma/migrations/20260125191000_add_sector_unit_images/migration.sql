-- Add missing imageUrl columns used by Prisma schema
ALTER TABLE "Unit" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Sector" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
