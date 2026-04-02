import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateTourDto {
  // Multi-language fields (required)
  @IsString()
  @IsNotEmpty()
  title_ka: string;

  @IsString()
  @IsNotEmpty()
  title_en: string;

  @IsString()
  @IsNotEmpty()
  title_ru: string;

  @IsString()
  @IsNotEmpty()
  description_ka: string;

  @IsString()
  @IsNotEmpty()
  description_en: string;

  @IsString()
  @IsNotEmpty()
  description_ru: string;

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

  // Legacy fields (kept for backward compatibility, optional)
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Non-translatable fields
  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
