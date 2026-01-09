INSERT INTO "Company" ("id", "name", "status", "createdAt", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000001', 'ADM', 'ACTIVE', NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
