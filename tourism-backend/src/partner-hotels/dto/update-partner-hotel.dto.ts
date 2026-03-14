import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdatePartnerHotelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  starRating?: number;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  coverImagePublicId?: string;

  @IsOptional()
  @IsString()
  shortDescription_ka?: string;

  @IsOptional()
  @IsString()
  shortDescription_en?: string;

  @IsOptional()
  @IsString()
  shortDescription_ru?: string;

  @IsOptional()
  @IsString()
  description_ka?: string;

  @IsOptional()
  @IsString()
  description_en?: string;

  @IsOptional()
  @IsString()
  description_ru?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  website?: string | null;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
