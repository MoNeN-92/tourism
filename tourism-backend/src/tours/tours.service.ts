import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async findAll() {
    return this.prisma.tour.findMany({
      where: { status: true },
      include: { images: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ დამატებული: findOne by ID
  async findOne(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async findBySlug(slug: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (!tour) throw new NotFoundException('Tour not found');
    return tour;
  }

  async create(createTourDto: CreateTourDto) {
    const slug = this.generateSlug(createTourDto.title_en);

    const existingTour = await this.prisma.tour.findUnique({
      where: { slug },
    });

    if (existingTour) {
      throw new ConflictException('Tour with this title already exists');
    }

    return this.prisma.tour.create({
      data: {
        ...createTourDto,
        slug,
        title: createTourDto.title_en,
        description: createTourDto.description_en,
        duration: String(createTourDto.duration),
        status: createTourDto.status ?? true,
      },
      include: { images: true },
    });
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    const tour = await this.prisma.tour.findUnique({ where: { id } });
    if (!tour) throw new NotFoundException('Tour not found');

    let slug = tour.slug;
    
    if (updateTourDto.title_en && updateTourDto.title_en !== tour.title_en) {
      slug = this.generateSlug(updateTourDto.title_en);
      const existing = await this.prisma.tour.findUnique({ where: { slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Tour already exists');
      }
    }

    return this.prisma.tour.update({
      where: { id },
      data: {
        ...updateTourDto,
        slug,
        ...(updateTourDto.title_en && { title: updateTourDto.title_en }),
        ...(updateTourDto.description_en && { description: updateTourDto.description_en }),
        ...(updateTourDto.duration && { duration: String(updateTourDto.duration) }),
      },
      include: { images: true },
    });
  }

  async delete(id: string) {
    const tour = await this.prisma.tour.findUnique({ where: { id } });
    if (!tour) throw new NotFoundException('Tour not found');
    
    await this.prisma.tour.delete({ where: { id } });
    return { message: 'Tour deleted successfully' };
  }
}