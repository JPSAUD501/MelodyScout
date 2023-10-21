/*
  Warnings:

  - Added the required column `posted` to the `PostRollout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostRollout" ADD COLUMN     "posted" BOOLEAN NOT NULL;
