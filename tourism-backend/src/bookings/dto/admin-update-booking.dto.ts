import {
  BookingServiceStatus,
  BookingStatus,
  Currency,
  PaymentAmountMode,
  RoomType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
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
  ValidateNested,
} from 'class-validator';
import {
  AdminBookingHotelServiceDto,
  AdminBookingTourDto,
} from './admin-create-booking.dto';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminBookingTourDto)
  tours?: AdminBookingTourDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminBookingHotelServiceDto)
  hotelService?: AdminBookingHotelServiceDto | null;

  // Legacy compatibility fields
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
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsEnum(PaymentAmountMode)
  amountPaidMode?: PaymentAmountMode;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  amountPaidPercent?: number | null;

  @IsOptional()
  @IsEnum(Object.values(BookingStatus))
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(Object.values(BookingServiceStatus))
  serviceStatus?: BookingServiceStatus;

  @IsOptional()
  @IsString()
  adminNote?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
