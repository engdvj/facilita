-- Ensure UUID helper exists for backfill
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create LinkUnit
CREATE TABLE "LinkUnit" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkUnit_pkey" PRIMARY KEY ("id")
);

-- Create ScheduleUnit
CREATE TABLE "ScheduleUnit" (
    "id" UUID NOT NULL,
    "scheduleId" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleUnit_pkey" PRIMARY KEY ("id")
);

-- Create NoteUnit
CREATE TABLE "NoteUnit" (
    "id" UUID NOT NULL,
    "noteId" UUID NOT NULL,
    "unitId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteUnit_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "LinkUnit_linkId_unitId_key" ON "LinkUnit"("linkId", "unitId");
CREATE INDEX "LinkUnit_linkId_idx" ON "LinkUnit"("linkId");
CREATE INDEX "LinkUnit_unitId_idx" ON "LinkUnit"("unitId");

CREATE UNIQUE INDEX "ScheduleUnit_scheduleId_unitId_key" ON "ScheduleUnit"("scheduleId", "unitId");
CREATE INDEX "ScheduleUnit_scheduleId_idx" ON "ScheduleUnit"("scheduleId");
CREATE INDEX "ScheduleUnit_unitId_idx" ON "ScheduleUnit"("unitId");

CREATE UNIQUE INDEX "NoteUnit_noteId_unitId_key" ON "NoteUnit"("noteId", "unitId");
CREATE INDEX "NoteUnit_noteId_idx" ON "NoteUnit"("noteId");
CREATE INDEX "NoteUnit_unitId_idx" ON "NoteUnit"("unitId");

-- Foreign keys
ALTER TABLE "LinkUnit" ADD CONSTRAINT "LinkUnit_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LinkUnit" ADD CONSTRAINT "LinkUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScheduleUnit" ADD CONSTRAINT "ScheduleUnit_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "UploadedSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduleUnit" ADD CONSTRAINT "ScheduleUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NoteUnit" ADD CONSTRAINT "NoteUnit_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NoteUnit" ADD CONSTRAINT "NoteUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill from legacy unitId columns when present
INSERT INTO "LinkUnit" ("id", "linkId", "unitId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "unitId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Link"
WHERE "unitId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "LinkUnit" lu
    WHERE lu."linkId" = "Link"."id" AND lu."unitId" = "Link"."unitId"
  );

INSERT INTO "ScheduleUnit" ("id", "scheduleId", "unitId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "unitId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "UploadedSchedule"
WHERE "unitId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "ScheduleUnit" su
    WHERE su."scheduleId" = "UploadedSchedule"."id" AND su."unitId" = "UploadedSchedule"."unitId"
  );

INSERT INTO "NoteUnit" ("id", "noteId", "unitId", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "id", "unitId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Note"
WHERE "unitId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "NoteUnit" nu
    WHERE nu."noteId" = "Note"."id" AND nu."unitId" = "Note"."unitId"
  );
