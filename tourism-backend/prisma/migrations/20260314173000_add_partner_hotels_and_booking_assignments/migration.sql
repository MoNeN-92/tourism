-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('DRIVER', 'GUIDE', 'PARTNER', 'CUSTOMER');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "partnerType" "PartnerType";

-- AlterTable
ALTER TABLE "BookingTour"
ADD COLUMN "driverId" TEXT,
ADD COLUMN "guideId" TEXT;

-- CreateTable
CREATE TABLE "PartnerHotel" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "starRating" INTEGER NOT NULL,
  "coverImageUrl" TEXT NOT NULL,
  "coverImagePublicId" TEXT NOT NULL,
  "shortDescription_ka" TEXT NOT NULL,
  "shortDescription_en" TEXT NOT NULL,
  "shortDescription_ru" TEXT NOT NULL,
  "description_ka" TEXT NOT NULL,
  "description_en" TEXT NOT NULL,
  "description_ru" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "contactPhone" TEXT NOT NULL,
  "website" TEXT,
  "isVisible" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PartnerHotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerHotelImage" (
  "id" TEXT NOT NULL,
  "partnerHotelId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PartnerHotelImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartnerHotel_slug_key" ON "PartnerHotel"("slug");

-- CreateIndex
CREATE INDEX "PartnerHotel_isVisible_createdAt_idx" ON "PartnerHotel"("isVisible", "createdAt");

-- CreateIndex
CREATE INDEX "PartnerHotelImage_partnerHotelId_idx" ON "PartnerHotelImage"("partnerHotelId");

-- CreateIndex
CREATE INDEX "BookingTour_driverId_idx" ON "BookingTour"("driverId");

-- CreateIndex
CREATE INDEX "BookingTour_guideId_idx" ON "BookingTour"("guideId");

-- AddForeignKey
ALTER TABLE "BookingTour"
ADD CONSTRAINT "BookingTour_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingTour"
ADD CONSTRAINT "BookingTour_guideId_fkey"
FOREIGN KEY ("guideId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerHotelImage"
ADD CONSTRAINT "PartnerHotelImage_partnerHotelId_fkey"
FOREIGN KEY ("partnerHotelId") REFERENCES "PartnerHotel"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
