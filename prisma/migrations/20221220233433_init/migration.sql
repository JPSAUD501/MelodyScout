-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TelegramUsers" (
    "telegramUserId" TEXT NOT NULL PRIMARY KEY,
    "lastfmUser" TEXT,
    "lastUpdate" TEXT NOT NULL
);
INSERT INTO "new_TelegramUsers" ("lastUpdate", "lastfmUser", "telegramUserId") SELECT "lastUpdate", "lastfmUser", "telegramUserId" FROM "TelegramUsers";
DROP TABLE "TelegramUsers";
ALTER TABLE "new_TelegramUsers" RENAME TO "TelegramUsers";
CREATE UNIQUE INDEX "TelegramUsers_telegramUserId_key" ON "TelegramUsers"("telegramUserId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
