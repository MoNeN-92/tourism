import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hotel.findMany({
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  create(dto: CreateHotelDto) {
    return this.prisma.hotel.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.trim().toLowerCase(),
      },
    });
  }

  async update(id: string, dto: UpdateHotelDto) {
    const existing = await this.prisma.hotel.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      throw new NotFoundException('Hotel not found');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.email !== undefined ? { email: dto.email.trim().toLowerCase() } : {}),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.hotel.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      throw new NotFoundException('Hotel not found');
    }

    await this.prisma.hotel.delete({ where: { id } });

    return { deleted: true, id };
  }
}
