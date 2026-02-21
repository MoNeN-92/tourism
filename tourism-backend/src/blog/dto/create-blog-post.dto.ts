import { IsString, IsBoolean, IsOptional } from 'class-validator'

export class CreateBlogPostDto {
  @IsString()
  slug: string

  @IsString()
  title_ka: string

  @IsString()
  title_en: string

  @IsString()
  title_ru: string

  @IsString()
  excerpt_ka: string

  @IsString()
  excerpt_en: string

  @IsString()
  excerpt_ru: string

  @IsString()
  content_ka: string

  @IsString()
  content_en: string

  @IsString()
  content_ru: string

  @IsString()
  author_ka: string

  @IsString()
  author_en: string

  @IsString()
  author_ru: string

  @IsString()
  coverImage: string

  @IsBoolean()
  @IsOptional()
  published?: boolean
}