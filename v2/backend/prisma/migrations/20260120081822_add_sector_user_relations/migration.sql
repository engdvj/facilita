-- Ensure UUID helper exists for backfill
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "SectorRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateTable
CREATE TABLE "SectorUnit" (
    "id" UUID NOT NULL,
    "sectorId" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SectorUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSector" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sectorId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "role" "SectorRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SectorUnit_sectorId_unitId_key" ON "SectorUnit"("sectorId", "unitId");

-- CreateIndex
CREATE INDEX "SectorUnit_sectorId_idx" ON "SectorUnit"("sectorId");

-- CreateIndex
CREATE INDEX "SectorUnit_unitId_idx" ON "SectorUnit"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSector_userId_sectorId_key" ON "UserSector"("userId", "sectorId");

-- CreateIndex
CREATE INDEX "UserSector_userId_idx" ON "UserSector"("userId");

-- CreateIndex
CREATE INDEX "UserSector_sectorId_idx" ON "UserSector"("sectorId");

-- AddForeignKey
ALTER TABLE "SectorUnit" ADD CONSTRAINT "SectorUnit_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SectorUnit" ADD CONSTRAINT "SectorUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSector" ADD CONSTRAINT "UserSector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSector" ADD CONSTRAINT "UserSector_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill data from legacy columns if present
INSERT INTO "SectorUnit" ("id", "sectorId", "unitId", "isPrimary", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "unitId", true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Sector"
WHERE "unitId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "SectorUnit" su
    WHERE su."sectorId" = "Sector"."id" AND su."unitId" = "Sector"."unitId"
  );

INSERT INTO "UserSector" ("id", "userId", "sectorId", "isPrimary", "role", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "sectorId", true, 'MEMBER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User"
WHERE "sectorId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "UserSector" us
    WHERE us."userId" = "User"."id" AND us."sectorId" = "User"."sectorId"
  );
