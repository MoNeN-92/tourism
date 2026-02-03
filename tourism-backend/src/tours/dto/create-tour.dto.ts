import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional } from 'class-validator';

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

  // Legacy fields (kept for backward compatibility, optional)
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  // Non-translatable fields
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}