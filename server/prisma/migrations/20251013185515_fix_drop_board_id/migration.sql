/*
  Warnings:

  - You are about to drop the column `activeBoardId` on the `Room` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Room_activeBoardId_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "activeBoardId";
