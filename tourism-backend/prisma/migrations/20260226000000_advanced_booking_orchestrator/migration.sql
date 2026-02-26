-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GEL', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "PaymentAmountMode" AS ENUM ('FLAT', 'PERCENT');

-- CreateEnum
CREATE TYPE "CarType" AS ENUM ('SEDAN', 'SUV', 'MINIVAN', 'MINIBUS', 'BUS', 'LUXURY');

-- AlterTable Admin: migrate text role to enum role
ALTER TABLE "Admin"
  ADD COLUMN "role_tmp" "AdminRole" NOT NULL DEFAULT 'ADMIN';

UPDATE "Admin"
SET "role_tmp" = CASE
  WHEN LOWER(COALESCE("role", '')) = 'moderator' THEN 'MODERATOR'::"AdminRole"
  ELSE 'ADMIN'::"AdminRole"
END;

ALTER TABLE "Admin"
  DROP COLUMN "role";

ALTER TABLE "Admin"
  RENAME COLUMN "role_tmp" TO "role";

-- AlterTable User
ALTER TABLE "User"
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable Booking
ALTER TABLE "Booking"
  ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'GEL',
  ADD COLUMN "amountPaidMode" "PaymentAmountMode" NOT NULL DEFAULT 'FLAT',
  ADD COLUMN "amountPaidPercent" DOUBLE PRECISION,
  ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable Hotel
CREATE TABLE "Hotel" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable BookingTour
CREATE TABLE "BookingTour" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "desiredDate" TIMESTAMP(3) NOT NULL,
  "adults" INTEGER NOT NULL DEFAULT 1,
  "children" INTEGER NOT NULL DEFAULT 0,
  "carType" "CarType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BookingTour_pkey" PRIMARY KEY ("id")
);

-- CreateTable BookingHotelService
CREATE TABLE "BookingHotelService" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "hotelId" TEXT NOT NULL,
  "checkIn" TIMESTAMP(3),
  "checkOut" TIMESTAMP(3),
  "notes" TEXT,
  "sendRequestToHotel" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BookingHotelService_pkey" PRIMARY KEY ("id")
);

-- CreateTable BookingHotelRoom
CREATE TABLE "BookingHotelRoom" (
  "id" TEXT NOT NULL,
  "hotelServiceId" TEXT NOT NULL,
  "roomType" TEXT NOT NULL,
  "guestCount" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BookingHotelRoom_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_name_email_key" ON "Hotel"("name", "email");

-- CreateIndex
CREATE INDEX "Booking_isDeleted_deletedAt_idx" ON "Booking"("isDeleted", "deletedAt");

-- CreateIndex
CREATE INDEX "BookingTour_bookingId_idx" ON "BookingTour"("bookingId");

-- CreateIndex
CREATE INDEX "BookingTour_tourId_desiredDate_idx" ON "BookingTour"("tourId", "desiredDate");

-- CreateIndex
CREATE UNIQUE INDEX "BookingHotelService_bookingId_key" ON "BookingHotelService"("bookingId");

-- CreateIndex
CREATE INDEX "BookingHotelService_hotelId_idx" ON "BookingHotelService"("hotelId");

-- CreateIndex
CREATE INDEX "BookingHotelRoom_hotelServiceId_idx" ON "BookingHotelRoom"("hotelServiceId");

-- AddForeignKey
ALTER TABLE "BookingTour" ADD CONSTRAINT "BookingTour_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingTour" ADD CONSTRAINT "BookingTour_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHotelService" ADD CONSTRAINT "BookingHotelService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHotelService" ADD CONSTRAINT "BookingHotelService_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHotelRoom" ADD CONSTRAINT "BookingHotelRoom_hotelServiceId_fkey" FOREIGN KEY ("hotelServiceId") REFERENCES "BookingHotelService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
