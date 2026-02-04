import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadToCloudinary(file: Express.Multer.File): Promise<UploadResponseDto> {
    try {
      const result = await this.cloudinaryService.uploadImage(file);

      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload image to Cloudinary: ${error.message}`,
      );
    }
  }
}