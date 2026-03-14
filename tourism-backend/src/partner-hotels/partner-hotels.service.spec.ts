import { NotFoundException } from '@nestjs/common';
import { PartnerHotelsService } from './partner-hotels.service';

describe('PartnerHotelsService', () => {
  const createPrismaMock = () => ({
    partnerHotel: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    partnerHotelImage: {
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  });

  it('creates partner hotel with generated slug and normalized public fields', async () => {
    const prisma = createPrismaMock();
    const service = new PartnerHotelsService(prisma as any);

    prisma.partnerHotel.findUnique.mockResolvedValue(null);
    prisma.partnerHotel.create.mockResolvedValue({
      id: 'hotel-1',
      slug: 'rooms-hotel-tbilisi',
      name: 'Rooms Hotel Tbilisi',
      starRating: 5,
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/hotel-cover.jpg',
      coverImagePublicId: 'partner-hotels/cover',
      shortDescription_ka: 'მოკლე აღწერა',
      shortDescription_en: 'Short description',
      shortDescription_ru: 'Короткое описание',
      description_ka: 'სრული აღწერა',
      description_en: 'Full description',
      description_ru: 'Полное описание',
      address: '14 Kostava Street, Tbilisi',
      contactPhone: '+995322000000',
      website: 'https://roomshotels.com',
      isVisible: true,
      images: [],
    });

    const result = await service.create({
      name: '  Rooms Hotel Tbilisi  ',
      starRating: 5,
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/hotel-cover.jpg',
      coverImagePublicId: 'partner-hotels/cover',
      shortDescription_ka: 'მოკლე აღწერა',
      shortDescription_en: 'Short description',
      shortDescription_ru: 'Короткое описание',
      description_ka: 'სრული აღწერა',
      description_en: 'Full description',
      description_ru: 'Полное описание',
      address: '14 Kostava Street, Tbilisi',
      contactPhone: '+995322000000',
      website: ' https://roomshotels.com ',
      isVisible: true,
    });

    expect(prisma.partnerHotel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'rooms-hotel-tbilisi',
          name: 'Rooms Hotel Tbilisi',
          website: 'https://roomshotels.com',
          isVisible: true,
        }),
      }),
    );
    expect(result.slug).toBe('rooms-hotel-tbilisi');
  });

  it('returns only visible hotels for public listing', async () => {
    const prisma = createPrismaMock();
    const service = new PartnerHotelsService(prisma as any);

    prisma.partnerHotel.findMany.mockResolvedValue([
      {
        id: 'hotel-1',
        slug: 'rooms-hotel-tbilisi',
        name: 'Rooms Hotel Tbilisi',
        isVisible: true,
      },
    ]);

    await service.findVisible();

    expect(prisma.partnerHotel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isVisible: true },
      }),
    );
  });

  it('rejects hidden hotel on public slug lookup', async () => {
    const prisma = createPrismaMock();
    const service = new PartnerHotelsService(prisma as any);

    prisma.partnerHotel.findUnique.mockResolvedValue(null);

    await expect(service.findVisibleBySlug('hidden-hotel')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
