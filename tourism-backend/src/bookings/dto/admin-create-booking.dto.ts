import {
  BookingServiceStatus,
  BookingStatus,
  CarType,
  Currency,
  PaymentAmountMode,
  RoomType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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

export class AdminBookingTourDto {
  @IsUUID()
  tourId: string;

  @IsDateString()
  desiredDate: string;

  @IsInt()
  @Min(1)
  @Max(50)
  adults: number;

  @IsInt()
  @Min(0)
  @Max(50)
  children: number;

  @IsEnum(CarType)
  carType: CarType;
}

export class AdminBookingHotelRoomDto {
  @IsString()
  roomType: string;

  @IsInt()
  @Min(1)
  @Max(50)
  guestCount: number;
}

export class AdminBookingHotelServiceDto {
  @IsUUID()
  hotelId: string;

  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  sendRequestToHotel?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminBookingHotelRoomDto)
  rooms?: AdminBookingHotelRoomDto[];
}

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdminBookingTourDto)
  tours?: AdminBookingTourDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AdminBookingHotelServiceDto)
  hotelService?: AdminBookingHotelServiceDto;

  // Legacy compatibility fields
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
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsEnum(PaymentAmountMode)
  amountPaidMode?: PaymentAmountMode;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  amountPaidPercent?: number;

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
