import { IsOptional, IsString, Matches } from 'class-validator';

export class AdminRevenueQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  fromMonth?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  toMonth?: string;
}
