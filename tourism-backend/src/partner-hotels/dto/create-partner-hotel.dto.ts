import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreatePartnerHotelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;

  @IsString()
  @IsNotEmpty()
  coverImageUrl: string;

  @IsString()
  @IsNotEmpty()
  coverImagePublicId: string;

  @IsString()
  @IsNotEmpty()
  shortDescription_ka: string;

  @IsString()
  @IsNotEmpty()
  shortDescription_en: string;

  @IsString()
  @IsNotEmpty()
  shortDescription_ru: string;

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
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
  })
  website?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
