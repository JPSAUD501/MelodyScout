/*
  Warnings:

  - You are about to drop the `ErrorLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ErrorLog";

-- CreateTable
CREATE TABLE "PostRollout" (
    "telegramChatId" TEXT NOT NULL,

    CONSTRAINT "PostRollout_pkey" PRIMARY KEY ("telegramChatId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostRollout_telegramChatId_key" ON "PostRollout"("telegramChatId");
