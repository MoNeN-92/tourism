import { Module } from '@nestjs/common';
import { UploadsController } from './dto/uploads.controller';
import { UploadsService } from './uploads.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}