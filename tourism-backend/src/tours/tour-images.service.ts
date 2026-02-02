import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TourImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadImages(tourId: string, files: Express.Multer.File[]) {
    const tour = await this.prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadedImages: any[] = [];

    for (const file of files) {
      const imageUrl = `/uploads/tours/${file.filename}`;

      const tourImage = await this.prisma.tourImage.create({
        data: {
          tourId,
          imageUrl,
        },
      });

      uploadedImages.push(tourImage);
    }

    return uploadedImages;
  }

  async getTourImages(tourSlug: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { slug: tourSlug },
      include: {
        images: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour.images;
  }
}