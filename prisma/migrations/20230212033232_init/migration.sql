-- CreateTable
CREATE TABLE "TelegramUsers" (
    "telegramUserId" TEXT NOT NULL,
    "lastfmUser" TEXT,
    "lastUpdate" TEXT NOT NULL,

    CONSTRAINT "TelegramUsers_pkey" PRIMARY KEY ("telegramUserId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUsers_telegramUserId_key" ON "TelegramUsers"("telegramUserId");
