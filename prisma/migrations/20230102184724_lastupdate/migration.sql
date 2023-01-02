/*
  Warnings:

  - Added the required column `lastArtist` to the `TrackingUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastScrobbleCount` to the `TrackingUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastTrack` to the `TrackingUsers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdate` to the `TrackingUsers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrackingUsers" ADD COLUMN     "lastArtist" TEXT NOT NULL,
ADD COLUMN     "lastScrobbleCount" TEXT NOT NULL,
ADD COLUMN     "lastTrack" TEXT NOT NULL,
ADD COLUMN     "lastUpdate" TEXT NOT NULL;
