/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagOnLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TagOnSchedule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,entityType,linkId,scheduleId,noteId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'NOTE';

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "TagOnLink" DROP CONSTRAINT "TagOnLink_linkId_fkey";

-- DropForeignKey
ALTER TABLE "TagOnLink" DROP CONSTRAINT "TagOnLink_tagId_fkey";

-- DropForeignKey
ALTER TABLE "TagOnSchedule" DROP CONSTRAINT "TagOnSchedule_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "TagOnSchedule" DROP CONSTRAINT "TagOnSchedule_tagId_fkey";

-- DropIndex
DROP INDEX "Favorite_userId_entityType_linkId_scheduleId_key";

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "noteId" UUID;

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "TagOnLink";

-- DropTable
DROP TABLE "TagOnSchedule";

-- DropEnum
DROP TYPE "NotificationStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_entityType_linkId_scheduleId_noteId_key" ON "Favorite"("userId", "entityType", "linkId", "scheduleId", "noteId");
