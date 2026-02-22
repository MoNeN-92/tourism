import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookingChangeRequestDto {
  @IsDateString()
  @IsNotEmpty()
  requestedDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
