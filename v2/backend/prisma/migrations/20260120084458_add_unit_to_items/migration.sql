-- Add unitId to content items for unit-scoped visibility
ALTER TABLE "Link" ADD COLUMN "unitId" UUID;
ALTER TABLE "UploadedSchedule" ADD COLUMN "unitId" UUID;
ALTER TABLE "Note" ADD COLUMN "unitId" UUID;

-- Indexes
CREATE INDEX "Link_unitId_idx" ON "Link"("unitId");
CREATE INDEX "UploadedSchedule_unitId_idx" ON "UploadedSchedule"("unitId");
CREATE INDEX "Note_unitId_idx" ON "Note"("unitId");

-- Foreign keys
ALTER TABLE "Link" ADD CONSTRAINT "Link_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UploadedSchedule" ADD CONSTRAINT "UploadedSchedule_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
