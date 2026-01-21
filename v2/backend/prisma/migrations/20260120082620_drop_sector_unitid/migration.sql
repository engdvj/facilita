-- Drop legacy unitId column from Sector (many-to-many now handled by SectorUnit)
ALTER TABLE "Sector" DROP CONSTRAINT IF EXISTS "Sector_unitId_fkey";
ALTER TABLE "Sector" DROP COLUMN IF EXISTS "unitId";
