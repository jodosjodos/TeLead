/*
  Warnings:

  - You are about to drop the column `mentor` on the `courses` table. All the data in the column will be lost.
  - Added the required column `mentorEmail` to the `courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentorName` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "mentor",
ADD COLUMN     "mentorEmail" TEXT NOT NULL,
ADD COLUMN     "mentorName" TEXT NOT NULL;
