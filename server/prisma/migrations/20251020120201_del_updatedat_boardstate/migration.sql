/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `BoardState` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."BoardState_boardId_updatedAt_idx";

-- AlterTable
ALTER TABLE "BoardState" DROP COLUMN "updatedAt";
