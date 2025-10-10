/*
  Warnings:

  - You are about to drop the column `roomId` on the `BoardState` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[boardId,version]` on the table `BoardState` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[activeBoardStateId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `boardId` to the `BoardState` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BoardState" DROP CONSTRAINT "BoardState_roomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_activeBoardId_fkey";

-- DropIndex
DROP INDEX "public"."BoardState_roomId_idx";

-- DropIndex
DROP INDEX "public"."BoardState_roomId_updatedAt_idx";

-- DropIndex
DROP INDEX "public"."BoardState_roomId_version_key";

-- AlterTable
ALTER TABLE "BoardState" DROP COLUMN "roomId",
ADD COLUMN     "boardId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "activeBoardStateId" INTEGER,
ALTER COLUMN "slug" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Board_roomId_idx" ON "Board"("roomId");

-- CreateIndex
CREATE INDEX "Board_roomId_updatedAt_idx" ON "Board"("roomId", "updatedAt");

-- CreateIndex
CREATE INDEX "BoardState_boardId_idx" ON "BoardState"("boardId");

-- CreateIndex
CREATE INDEX "BoardState_boardId_version_idx" ON "BoardState"("boardId", "version");

-- CreateIndex
CREATE INDEX "BoardState_boardId_updatedAt_idx" ON "BoardState"("boardId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BoardState_boardId_version_key" ON "BoardState"("boardId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Room_activeBoardStateId_key" ON "Room"("activeBoardStateId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_activeBoardId_fkey" FOREIGN KEY ("activeBoardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_activeBoardStateId_fkey" FOREIGN KEY ("activeBoardStateId") REFERENCES "BoardState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardState" ADD CONSTRAINT "BoardState_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
