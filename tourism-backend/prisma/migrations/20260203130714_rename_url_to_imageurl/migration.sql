/*
  Warnings:

  - You are about to drop the column `url` on the `TourImage` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `TourImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TourImage" DROP COLUMN "url",
ADD COLUMN     "imageUrl" TEXT NOT NULL;
