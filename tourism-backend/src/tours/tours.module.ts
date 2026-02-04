import { Module } from '@nestjs/common';
import { ToursController, AdminToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { TourImagesService } from './tour-images.service';
import { AdminTourImagesController, TourImagesController } from './tour-images.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [
    ToursController,
    AdminToursController,
    AdminTourImagesController,
    TourImagesController,
  ],
  providers: [ToursService, TourImagesService],
})
export class ToursModule {}