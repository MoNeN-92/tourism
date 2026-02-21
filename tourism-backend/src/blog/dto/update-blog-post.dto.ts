import { IsString, IsBoolean, IsOptional } from 'class-validator'

export class UpdateBlogPostDto {
  @IsString()
  @IsOptional()
  slug?: string

  @IsString()
  @IsOptional()
  title_ka?: string

  @IsString()
  @IsOptional()
  title_en?: string

  @IsString()
  @IsOptional()
  title_ru?: string

  @IsString()
  @IsOptional()
  excerpt_ka?: string

  @IsString()
  @IsOptional()
  excerpt_en?: string

  @IsString()
  @IsOptional()
  excerpt_ru?: string

  @IsString()
  @IsOptional()
  content_ka?: string

  @IsString()
  @IsOptional()
  content_en?: string

  @IsString()
  @IsOptional()
  content_ru?: string

  @IsString()
  @IsOptional()
  author_ka?: string

  @IsString()
  @IsOptional()
  author_en?: string

  @IsString()
  @IsOptional()
  author_ru?: string

  @IsString()
  @IsOptional()
  coverImage?: string

  @IsBoolean()
  @IsOptional()
  published?: boolean
}