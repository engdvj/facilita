/*
  Warnings:

  - The values [COORDINATOR,MANAGER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContentAudience" AS ENUM ('PUBLIC', 'COMPANY', 'SECTOR', 'PRIVATE', 'ADMIN', 'SUPERADMIN');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPERADMIN', 'ADMIN', 'COLLABORATOR');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TABLE "RolePermission" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'COLLABORATOR';
COMMIT;

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "audience" "ContentAudience" NOT NULL DEFAULT 'COMPANY',
ADD COLUMN     "imagePosition" TEXT,
ADD COLUMN     "imageScale" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UploadedSchedule" ADD COLUMN     "audience" "ContentAudience" NOT NULL DEFAULT 'COMPANY';
