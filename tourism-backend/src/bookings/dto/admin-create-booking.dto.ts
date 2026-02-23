import { BookingStatus, RoomType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class AdminCreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  tourId: string;

  @IsDateString()
  @IsNotEmpty()
  desiredDate: string;

  @IsInt()
  @Min(1)
  @Max(50)
  adults: number;

  @IsInt()
  @Min(0)
  @Max(50)
  children: number;

  @IsEnum(RoomType)
  roomType: RoomType;

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
