import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class TourImagesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async uploadImages(tourId: string, files: Express.Multer.File[]) {
    // ატვირთეთ ყველა ფაილი Cloudinary-ზე
    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file),
    );

    const uploadResults = await Promise.all(uploadPromises);

    // შევინახოთ database-ში
    const imageRecords = await Promise.all(
      uploadResults.map((result) =>
        this.prisma.tourImage.create({
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            tourId,
          },
        }),
      ),
    );

    return imageRecords;
  }

  async addImageToTour(tourId: string, url: string, publicId: string) {
    return this.prisma.tourImage.create({
      data: {
        url,
        publicId,
        tourId,
      },
    });
  }

  async getTourImages(slug: string) {
    // პირველ რიგში ვიპოვოთ tour slug-ით
    const tour = await this.prisma.tour.findUnique({
      where: { slug },
      include: { images: true },
    });

    return tour?.images || [];
  }

  async deleteImage(imageId: string) {
    return this.prisma.tourImage.delete({
      where: { id: imageId },
    });
  }

  async deleteImagesByTourId(tourId: string) {
    return this.prisma.tourImage.deleteMany({
      where: { tourId },
    });
  }
}