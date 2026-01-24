-- Create UserSectorUnit relation table
CREATE TABLE "UserSectorUnit" (
    "id" UUID NOT NULL,
    "userSectorId" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSectorUnit_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "UserSectorUnit_userSectorId_unitId_key" ON "UserSectorUnit"("userSectorId", "unitId");
CREATE INDEX "UserSectorUnit_userSectorId_idx" ON "UserSectorUnit"("userSectorId");
CREATE INDEX "UserSectorUnit_unitId_idx" ON "UserSectorUnit"("unitId");

-- Foreign keys
ALTER TABLE "UserSectorUnit" ADD CONSTRAINT "UserSectorUnit_userSectorId_fkey" FOREIGN KEY ("userSectorId") REFERENCES "UserSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSectorUnit" ADD CONSTRAINT "UserSectorUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
