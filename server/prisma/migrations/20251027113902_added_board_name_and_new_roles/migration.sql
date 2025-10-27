/*
  Warnings:

  - Added the required column `name` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'BANNED';

-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "name" TEXT NOT NULL;
