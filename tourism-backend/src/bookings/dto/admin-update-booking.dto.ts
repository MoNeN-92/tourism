import { BookingServiceStatus, BookingStatus, RoomType } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AdminUpdateBookingDto {
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsOptional()
  @IsString()
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsOptional()
  @IsString()
  tourId?: string | null;

  @IsOptional()
  @IsDateString()
  desiredDate?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  adults?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  children?: number | null;

  @IsOptional()
  @IsEnum(Object.values(RoomType))
  roomType?: RoomType | null;

  @IsOptional()
  @IsString()
  hotelName?: string | null;

  @IsOptional()
  @IsDateString()
  hotelCheckIn?: string | null;

  @IsOptional()
  @IsDateString()
  hotelCheckOut?: string | null;

  @IsOptional()
  @IsString()
  hotelRoomType?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  hotelGuests?: number | null;

  @IsOptional()
  @IsString()
  hotelNotes?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsEnum(Object.values(BookingStatus))
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(Object.values(BookingServiceStatus))
  serviceStatus?: BookingServiceStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;
}