-- CreateTable
CREATE TABLE "TrackerChats" (
    "chatId" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "TrackingUsers" (
    "lastfmUser" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "TelegramUsers" (
    "telegramUserId" TEXT NOT NULL PRIMARY KEY,
    "lastfmUser" TEXT,
    "lastUpdate" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TrackerChatsToTrackingUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TrackerChatsToTrackingUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "TrackerChats" ("chatId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TrackerChatsToTrackingUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "TrackingUsers" ("lastfmUser") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackerChats_chatId_key" ON "TrackerChats"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingUsers_lastfmUser_key" ON "TrackingUsers"("lastfmUser");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramUsers_telegramUserId_key" ON "TelegramUsers"("telegramUserId");

-- CreateIndex
CREATE UNIQUE INDEX "_TrackerChatsToTrackingUsers_AB_unique" ON "_TrackerChatsToTrackingUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_TrackerChatsToTrackingUsers_B_index" ON "_TrackerChatsToTrackingUsers"("B");
