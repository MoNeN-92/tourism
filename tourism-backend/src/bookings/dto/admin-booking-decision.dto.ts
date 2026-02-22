import { IsOptional, IsString } from 'class-validator';

export class AdminBookingDecisionDto {
  @IsOptional()
  @IsString()
  adminNote?: string;
}
