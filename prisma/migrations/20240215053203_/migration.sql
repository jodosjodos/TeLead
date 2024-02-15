/*
  Warnings:

  - The values [THREED_DESIGN] on the enum `CATEGORY` will be removed. If these variants are still used in the database, this will fail.
  - The values [PRATICE_TEST] on the enum `FEATURES` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `bookmarked` on the `courses` table. All the data in the column will be lost.
  - Changed the column `features` on the `courses` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CATEGORY_new" AS ENUM ('THREE_DESIGN', 'GRAPHIC_DESIGN', 'WEB_DEVELOPMENT', 'SEO_MARKETING', 'FINANCE_ACCOUNTING', 'PERSONAL_DEVELOPMENT', 'OFFICE_PRODUCTIVITY', 'HR_MANAGEMENT');
ALTER TABLE "courses" ALTER COLUMN "category" TYPE "CATEGORY_new" USING ("category"::text::"CATEGORY_new");
ALTER TYPE "CATEGORY" RENAME TO "CATEGORY_old";
ALTER TYPE "CATEGORY_new" RENAME TO "CATEGORY";
DROP TYPE "CATEGORY_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FEATURES_new" AS ENUM ('ALL_CAPTION', 'QUIZZES', 'CODING_EXERCISES', 'PRACTICE_TEST');
ALTER TABLE "courses" ALTER COLUMN "features" TYPE "FEATURES_new"[] USING ("features"::text::"FEATURES_new"[]);
ALTER TYPE "FEATURES" RENAME TO "FEATURES_old";
ALTER TYPE "FEATURES_new" RENAME TO "FEATURES";
DROP TYPE "FEATURES_old";
COMMIT;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "bookmarked",
ALTER COLUMN "features" SET DATA TYPE "FEATURES"[];
