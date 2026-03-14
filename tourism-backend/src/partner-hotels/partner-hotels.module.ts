import { Module } from '@nestjs/common';
import { PartnerHotelsController, AdminPartnerHotelsController } from './partner-hotels.controller';
import { PartnerHotelsService } from './partner-hotels.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [PartnerHotelsController, AdminPartnerHotelsController],
  providers: [PartnerHotelsService],
  exports: [PartnerHotelsService],
})
export class PartnerHotelsModule {}
