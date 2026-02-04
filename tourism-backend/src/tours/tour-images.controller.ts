import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TourImagesService } from './tour-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/tours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminTourImagesController {
  constructor(private tourImagesService: TourImagesService) {}

  @Post(':id/images')
  @Roles('admin')
  async attachImage(
    @Param('id') tourId: string,
    @Body() body: { url: string; publicId: string },
  ) {
    return this.tourImagesService.addImageToTour(
      tourId,
      body.url,
      body.publicId,
    );
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