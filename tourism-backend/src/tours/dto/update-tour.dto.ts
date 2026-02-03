import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTourDto {
  // Multi-language fields
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title_ka?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title_en?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title_ru?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description_ka?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description_en?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description_ru?: string;

  @IsString()
  @IsOptional()
  location_ka?: string;

  @IsString()
  @IsOptional()
  location_en?: string;

  @IsString()
  @IsOptional()
  location_ru?: string;

  // Legacy fields
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  // Non-translatable fields
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  duration?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}