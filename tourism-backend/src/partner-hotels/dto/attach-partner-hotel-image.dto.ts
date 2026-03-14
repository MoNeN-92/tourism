import { IsNotEmpty, IsString } from 'class-validator';

export class AttachPartnerHotelImageDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  publicId: string;
}
