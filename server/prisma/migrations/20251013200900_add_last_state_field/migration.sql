/*
  Warnings:

  - A unique constraint covering the columns `[lastState]` on the table `Board` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "lastState" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Board_lastState_key" ON "Board"("lastState");

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_lastState_fkey" FOREIGN KEY ("lastState") REFERENCES "BoardState"("id") ON DELETE SET NULL ON UPDATE CASCADE;
