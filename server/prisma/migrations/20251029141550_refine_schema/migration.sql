/*
  Warnings:

  - The values [PENDING,BANNED] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `slug` on the `Room` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'BANNED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'MODERATOR', 'EDITOR', 'MEMBER', 'VIEWER');
ALTER TABLE "public"."Membership" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Membership" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "Membership" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- DropIndex
DROP INDEX "public"."Membership_userId_roomId_key";

-- DropIndex
DROP INDEX "public"."Room_slug_key";

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "slug",
ADD COLUMN     "name" VARCHAR(64) NOT NULL;

-- CreateIndex
CREATE INDEX "Membership_roomId_status_idx" ON "Membership"("roomId", "status");

-- CreateIndex
CREATE INDEX "Membership_roomId_role_idx" ON "Membership"("roomId", "role");

-- CreateIndex
CREATE INDEX "Room_name_idx" ON "Room"("name");
