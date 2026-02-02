import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { TourImagesService } from './tour-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerConfig } from './interceptors/file-validation.interceptor';

@Controller('admin/tours')
@UseGuards(JwtAuthGuard)
export class AdminTourImagesController {
  constructor(private tourImagesService: TourImagesService) {}

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  uploadImages(
    @Param('id') tourId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.tourImagesService.uploadImages(tourId, files);
  }
}

@Controller('tours')
export class TourImagesController {
  constructor(private tourImagesService: TourImagesService) {}

  @Get(':slug/images')
  getTourImages(@Param('slug') slug: string) {
    return this.tourImagesService.getTourImages(slug);
  }
}