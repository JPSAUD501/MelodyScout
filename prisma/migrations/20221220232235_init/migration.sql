/*
  Warnings:

  - You are about to alter the column `lastUpdate` on the `TelegramUsers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TelegramUsers" (
    "telegramUserId" TEXT NOT NULL PRIMARY KEY,
    "lastfmUser" TEXT,
    "lastUpdate" BIGINT NOT NULL
);
INSERT INTO "new_TelegramUsers" ("lastUpdate", "lastfmUser", "telegramUserId") SELECT "lastUpdate", "lastfmUser", "telegramUserId" FROM "TelegramUsers";
DROP TABLE "TelegramUsers";
ALTER TABLE "new_TelegramUsers" RENAME TO "TelegramUsers";
CREATE UNIQUE INDEX "TelegramUsers_telegramUserId_key" ON "TelegramUsers"("telegramUserId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
