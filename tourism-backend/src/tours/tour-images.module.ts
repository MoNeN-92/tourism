import { Module } from '@nestjs/common';
import { AdminTourImagesController, TourImagesController } from './tour-images.controller';
import { TourImagesService } from './tour-images.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [AdminTourImagesController, TourImagesController],
  providers: [TourImagesService],
})
export class TourImagesModule {}