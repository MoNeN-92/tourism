import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

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

  @IsString()
  @IsOptional()
  itinerary_ka?: string;

  @IsString()
  @IsOptional()
  itinerary_en?: string;

  @IsString()
  @IsOptional()
  itinerary_ru?: string;

  @IsString()
  @IsOptional()
  highlights_ka?: string;

  @IsString()
  @IsOptional()
  highlights_en?: string;

  @IsString()
  @IsOptional()
  highlights_ru?: string;

  @IsString()
  @IsOptional()
  idealFor_ka?: string;

  @IsString()
  @IsOptional()
  idealFor_en?: string;

  @IsString()
  @IsOptional()
  idealFor_ru?: string;

  @IsString()
  @IsOptional()
  includes_ka?: string;

  @IsString()
  @IsOptional()
  includes_en?: string;

  @IsString()
  @IsOptional()
  includes_ru?: string;

  @IsString()
  @IsOptional()
  excludes_ka?: string;

  @IsString()
  @IsOptional()
  excludes_en?: string;

  @IsString()
  @IsOptional()
  excludes_ru?: string;

  @IsString()
  @IsOptional()
  pickup_ka?: string;

  @IsString()
  @IsOptional()
  pickup_en?: string;

  @IsString()
  @IsOptional()
  pickup_ru?: string;

  @IsString()
  @IsOptional()
  bestSeason_ka?: string;

  @IsString()
  @IsOptional()
  bestSeason_en?: string;

  @IsString()
  @IsOptional()
  bestSeason_ru?: string;

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
