-- CreateTable
CREATE TABLE "TrackerChats" (
    "chatId" TEXT NOT NULL,

    CONSTRAINT "TrackerChats_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "TrackingUsers" (
    "lastfmUser" TEXT NOT NULL,

    CONSTRAINT "TrackingUsers_pkey" PRIMARY KEY ("lastfmUser")
);

-- CreateTable
CREATE TABLE "TelegramUsers" (
    "telegramUserId" TEXT NOT NULL,
    "lastfmUser" TEXT,
    "lastUpdate" TEXT NOT NULL,

    CONSTRAINT "TelegramUsers_pkey" PRIMARY KEY ("telegramUserId")
);

-- CreateTable
CREATE TABLE "_TrackerChatsToTrackingUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
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

-- AddForeignKey
ALTER TABLE "_TrackerChatsToTrackingUsers" ADD CONSTRAINT "_TrackerChatsToTrackingUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "TrackerChats"("chatId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TrackerChatsToTrackingUsers" ADD CONSTRAINT "_TrackerChatsToTrackingUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "TrackingUsers"("lastfmUser") ON DELETE CASCADE ON UPDATE CASCADE;
