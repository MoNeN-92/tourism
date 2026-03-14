import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PartnerHotelsService } from './partner-hotels.service';
import { CreatePartnerHotelDto } from './dto/create-partner-hotel.dto';
import { UpdatePartnerHotelDto } from './dto/update-partner-hotel.dto';
import { AttachPartnerHotelImageDto } from './dto/attach-partner-hotel-image.dto';

@Controller('partner-hotels')
export class PartnerHotelsController {
  constructor(private readonly partnerHotelsService: PartnerHotelsService) {}

  @Get()
  findVisible() {
    return this.partnerHotelsService.findVisible();
  }

  @Get(':slug')
  findVisibleBySlug(@Param('slug') slug: string) {
    return this.partnerHotelsService.findVisibleBySlug(slug);
  }
}

@Controller('admin/partner-hotels')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminPartnerHotelsController {
  constructor(private readonly partnerHotelsService: PartnerHotelsService) {}

  @Get()
  findAllAdmin() {
    return this.partnerHotelsService.findAllAdmin();
  }

  @Get(':id')
  findOneAdmin(@Param('id') id: string) {
    return this.partnerHotelsService.findOneAdmin(id);
  }

  @Post()
  create(@Body() dto: CreatePartnerHotelDto) {
    return this.partnerHotelsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartnerHotelDto) {
    return this.partnerHotelsService.update(id, dto);
  }

  @Post(':id/images')
  addImage(@Param('id') id: string, @Body() dto: AttachPartnerHotelImageDto) {
    return this.partnerHotelsService.addImage(id, dto.url, dto.publicId);
  }

  @Delete('images/:imageId')
  deleteImage(@Param('imageId') imageId: string) {
    return this.partnerHotelsService.deleteImage(imageId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.partnerHotelsService.remove(id);
  }
}
