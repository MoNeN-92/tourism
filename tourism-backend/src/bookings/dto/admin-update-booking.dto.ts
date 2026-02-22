import { RoomType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AdminUpdateBookingDto {
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
  adminNote?: string;
}
