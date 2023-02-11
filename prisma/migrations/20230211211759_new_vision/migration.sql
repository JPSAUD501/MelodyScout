/*
  Warnings:

  - You are about to drop the `TrackerChats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrackingUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TrackerChatsToTrackingUsers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TrackerChatsToTrackingUsers" DROP CONSTRAINT "_TrackerChatsToTrackingUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_TrackerChatsToTrackingUsers" DROP CONSTRAINT "_TrackerChatsToTrackingUsers_B_fkey";

-- DropTable
DROP TABLE "TrackerChats";

-- DropTable
DROP TABLE "TrackingUsers";

-- DropTable
DROP TABLE "_TrackerChatsToTrackingUsers";
