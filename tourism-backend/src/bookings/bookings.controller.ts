import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../user-auth/decorators/current-user.decorator';
import { UserJwtAuthGuard } from '../user-auth/guards/user-jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingChangeRequestDto } from './dto/create-booking-change-request.dto';
import { AdminUpdateBookingDto } from './dto/admin-update-booking.dto';
import { AdminBookingDecisionDto } from './dto/admin-booking-decision.dto';
import { AdminBookingsQueryDto } from './dto/admin-bookings-query.dto';
import { AdminCreateBookingDto } from './dto/admin-create-booking.dto';
import { AdminRevenueQueryDto } from './dto/admin-revenue-query.dto';

@Controller('bookings')
@UseGuards(UserJwtAuthGuard)
export class UserBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('my')
  findMy(@CurrentUser() user: any) {
    return this.bookingsService.findMy(user.id);
  }

  @Get('my/:id')
  findMyOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.findMyOne(user.id, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingsService.cancelByUser(user.id, id);
  }

  @Post(':id/change-request')
  requestDateChange(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateBookingChangeRequestDto,
  ) {
    return this.bookingsService.requestDateChange(user.id, id, dto);
  }
}

@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('calendar')
  calendar(@Query('month') month: string) {
    return this.bookingsService.getCalendar(month);
  }

  @Post('change-requests/:id/approve')
  approveChangeRequest(
    @Param('id') id: string,
    @Body() dto: AdminBookingDecisionDto,
  ) {
    return this.bookingsService.approveChangeRequest(id, dto);
  }

  @Post('change-requests/:id/reject')
  rejectChangeRequest(
    @Param('id') id: string,
    @Body() dto: AdminBookingDecisionDto,
  ) {
    return this.bookingsService.rejectChangeRequest(id, dto);
  }

  @Get()
  findAll(@Query() query: AdminBookingsQueryDto) {
    return this.bookingsService.findAllAdmin(query);
  }

  @Get('trash')
  findTrash(@Query() query: AdminBookingsQueryDto) {
    return this.bookingsService.findTrashAdmin(query);
  }

  @Get('revenue/summary')
  @Roles(UserRole.ADMIN)
  revenueSummary(@Query() query: AdminRevenueQueryDto) {
    return this.bookingsService.getRevenueSummary(query);
  }

  @Post()
  create(@Body() dto: AdminCreateBookingDto) {
    return this.bookingsService.createAdmin(dto);
  }

  @Get(':id/invoice')
  getInvoice(@Param('id') id: string) {
    return this.bookingsService.getInvoice(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOneAdmin(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: AdminUpdateBookingDto) {
    return this.bookingsService.updateAdmin(id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: AdminBookingDecisionDto) {
    return this.bookingsService.approveBooking(id, dto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: AdminBookingDecisionDto) {
    return this.bookingsService.rejectBooking(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.bookingsService.deleteAdmin(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.bookingsService.restoreAdmin(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  permanentDelete(@Param('id') id: string) {
    return this.bookingsService.permanentDeleteAdmin(id);
  }
}
