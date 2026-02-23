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

export class AdminCreateBookingDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

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
  @IsUUID()
  tourId?: string;

  @IsOptional()
  @IsDateString()
  desiredDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  adults?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  children?: number;

  @IsOptional()
  @IsEnum(RoomType)
  roomType?: RoomType;

  @IsOptional()
  @IsString()
  hotelName?: string;

  @IsOptional()
  @IsDateString()
  hotelCheckIn?: string;

  @IsOptional()
  @IsDateString()
  hotelCheckOut?: string;

  @IsOptional()
  @IsString()
  hotelRoomType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  hotelGuests?: number;

  @IsOptional()
  @IsString()
  hotelNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsEnum(BookingServiceStatus)
  serviceStatus?: BookingServiceStatus;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  adminNote?: string;
}
