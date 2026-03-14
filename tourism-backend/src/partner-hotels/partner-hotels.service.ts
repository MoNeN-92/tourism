import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePartnerHotelDto } from './dto/create-partner-hotel.dto';
import { UpdatePartnerHotelDto } from './dto/update-partner-hotel.dto';

const PARTNER_HOTEL_INCLUDE = {
  images: {
    orderBy: { createdAt: 'asc' },
  },
} as const;

@Injectable()
export class PartnerHotelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeOptionalText(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private async ensureUniqueSlug(slug: string, currentId?: string) {
    const existing = await this.prisma.partnerHotel.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Partner hotel with this name already exists');
    }
  }

  async findAllAdmin() {
    return this.prisma.partnerHotel.findMany({
      include: PARTNER_HOTEL_INCLUDE,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findOneAdmin(id: string) {
    const hotel = await this.prisma.partnerHotel.findUnique({
      where: { id },
      include: PARTNER_HOTEL_INCLUDE,
    });

    if (!hotel) {
      throw new NotFoundException('Partner hotel not found');
    }

    return hotel;
  }

  async findVisible() {
    return this.prisma.partnerHotel.findMany({
      where: { isVisible: true },
      include: PARTNER_HOTEL_INCLUDE,
      orderBy: [{ starRating: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findVisibleBySlug(slug: string) {
    const hotel = await this.prisma.partnerHotel.findUnique({
      where: { slug: slug.trim() },
      include: PARTNER_HOTEL_INCLUDE,
    });

    if (!hotel || !hotel.isVisible) {
      throw new NotFoundException('Partner hotel not found');
    }

    return hotel;
  }

  async create(dto: CreatePartnerHotelDto) {
    const name = dto.name.trim();
    const slug = this.generateSlug(name);
    await this.ensureUniqueSlug(slug);

    return this.prisma.partnerHotel.create({
      data: {
        name,
        slug,
        starRating: dto.starRating,
        coverImageUrl: dto.coverImageUrl.trim(),
        coverImagePublicId: dto.coverImagePublicId.trim(),
        shortDescription_ka: dto.shortDescription_ka.trim(),
        shortDescription_en: dto.shortDescription_en.trim(),
        shortDescription_ru: dto.shortDescription_ru.trim(),
        description_ka: dto.description_ka.trim(),
        description_en: dto.description_en.trim(),
        description_ru: dto.description_ru.trim(),
        address: dto.address.trim(),
        contactPhone: dto.contactPhone.trim(),
        website: this.normalizeOptionalText(dto.website),
        isVisible: dto.isVisible ?? true,
      },
      include: PARTNER_HOTEL_INCLUDE,
    });
  }

  async update(id: string, dto: UpdatePartnerHotelDto) {
    const existing = await this.findOneAdmin(id);
    let slug = existing.slug;

    if (dto.name !== undefined && dto.name.trim() !== existing.name) {
      slug = this.generateSlug(dto.name);
      await this.ensureUniqueSlug(slug, id);
    }

    return this.prisma.partnerHotel.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim(), slug } : {}),
        ...(dto.starRating !== undefined ? { starRating: dto.starRating } : {}),
        ...(dto.coverImageUrl !== undefined ? { coverImageUrl: dto.coverImageUrl.trim() } : {}),
        ...(dto.coverImagePublicId !== undefined
          ? { coverImagePublicId: dto.coverImagePublicId.trim() }
          : {}),
        ...(dto.shortDescription_ka !== undefined
          ? { shortDescription_ka: dto.shortDescription_ka.trim() }
          : {}),
        ...(dto.shortDescription_en !== undefined
          ? { shortDescription_en: dto.shortDescription_en.trim() }
          : {}),
        ...(dto.shortDescription_ru !== undefined
          ? { shortDescription_ru: dto.shortDescription_ru.trim() }
          : {}),
        ...(dto.description_ka !== undefined ? { description_ka: dto.description_ka.trim() } : {}),
        ...(dto.description_en !== undefined ? { description_en: dto.description_en.trim() } : {}),
        ...(dto.description_ru !== undefined ? { description_ru: dto.description_ru.trim() } : {}),
        ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
        ...(dto.contactPhone !== undefined ? { contactPhone: dto.contactPhone.trim() } : {}),
        ...(dto.website !== undefined ? { website: this.normalizeOptionalText(dto.website) } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
      },
      include: PARTNER_HOTEL_INCLUDE,
    });
  }

  async addImage(partnerHotelId: string, url: string, publicId: string) {
    await this.findOneAdmin(partnerHotelId);

    return this.prisma.partnerHotelImage.create({
      data: {
        partnerHotelId,
        url,
        publicId,
      },
    });
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.partnerHotelImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('Partner hotel image not found');
    }

    await this.cloudinaryService.deleteImage(image.publicId);
    await this.prisma.partnerHotelImage.delete({
      where: { id: imageId },
    });

    return { deleted: true, id: imageId };
  }

  async remove(id: string) {
    const existing = await this.findOneAdmin(id);
    const publicIds = new Set([
      existing.coverImagePublicId,
      ...existing.images.map((image) => image.publicId),
    ]);

    await Promise.all(
      Array.from(publicIds)
        .filter((publicId) => Boolean(publicId))
        .map((publicId) => this.cloudinaryService.deleteImage(publicId)),
    );

    await this.prisma.partnerHotel.delete({
      where: { id },
    });

    return { deleted: true, id };
  }
}
