import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BookingChangeRequestStatus,
  BookingStatus,
  CarType,
  NotificationType,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsAdminMutationService } from './bookings-admin-mutation.service';
import { BookingsAdminReadService } from './bookings-admin-read.service';
import { BookingsApprovalService } from './bookings-approval.service';
import { AdminBookingDecisionDto } from './dto/admin-booking-decision.dto';
import { AdminBookingsQueryDto } from './dto/admin-bookings-query.dto';
import { AdminCreateBookingDto } from './dto/admin-create-booking.dto';
import { AdminRevenueQueryDto } from './dto/admin-revenue-query.dto';
import { AdminUpdateBookingDto } from './dto/admin-update-booking.dto';
import { CreateBookingChangeRequestDto } from './dto/create-booking-change-request.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { parseBookingDateInput, toDateOnly, withBalance } from './bookings.shared';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly adminReadService: BookingsAdminReadService,
    private readonly adminMutationService: BookingsAdminMutationService,
    private readonly approvalService: BookingsApprovalService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const tour = await this.prisma.tour.findUnique({
      where: { id: dto.tourId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!tour || !tour.status) {
      throw new NotFoundException('Tour not found');
    }

    const desiredDate = parseBookingDateInput(dto.desiredDate);

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        tourId: dto.tourId,
        desiredDate,
        adults: dto.adults,
        children: dto.children,
        roomType: dto.roomType,
        note: dto.note,
        tours: {
          create: {
            tourId: dto.tourId,
            desiredDate,
            adults: dto.adults,
            children: dto.children,
            carType: CarType.SEDAN,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        tour: {
          select: {
            title_en: true,
          },
        },
      },
    });

    await this.notificationsService.createForUser({
      userId,
      type: NotificationType.BOOKING_CREATED,
      title: 'Booking submitted',
      body: `Your booking for ${toDateOnly(desiredDate)} is pending approval.`,
      metadata: { bookingId: booking.id },
    });

    if (booking.user?.email && booking.tour?.title_en && booking.desiredDate) {
      await this.emailService.sendBookingCreatedEmail({
        recipientEmail: booking.user.email,
        bookingId: booking.id,
        tourTitle: booking.tour.title_en,
        desiredDate: toDateOnly(booking.desiredDate),
      });
    }

    return withBalance(booking);
  }

  findMy(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId, isDeleted: false },
      include: {
        tour: {
          select: {
            id: true,
            slug: true,
            title_ka: true,
            title_en: true,
            title_ru: true,
          },
        },
        changeRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOne(userId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        tour: {
          select: {
            id: true,
            slug: true,
            title_ka: true,
            title_en: true,
            title_ru: true,
          },
        },
        changeRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking || booking.userId !== userId || booking.isDeleted) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelByUser(userId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!booking || booking.userId !== userId || booking.isDeleted) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
      throw new BadRequestException('Booking cannot be cancelled in current status');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await this.notificationsService.createForUser({
      userId,
      type: NotificationType.BOOKING_CANCELLED,
      title: 'Booking cancelled',
      body: `Booking ${updated.id} was cancelled.`,
      metadata: { bookingId: updated.id },
    });

    if (booking.user?.email) {
      await this.emailService.sendBookingDecisionEmail({
        recipientEmail: booking.user.email,
        bookingId: booking.id,
        decision: 'cancelled',
      });
    }

    return withBalance(updated);
  }

  async requestDateChange(
    userId: string,
    bookingId: string,
    dto: CreateBookingChangeRequestDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        status: true,
        isDeleted: true,
      },
    });

    if (!booking || booking.userId !== userId || booking.isDeleted) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
      throw new BadRequestException('Date change is not allowed for this booking');
    }

    const existingPending = await this.prisma.bookingChangeRequest.findFirst({
      where: {
        bookingId,
        status: BookingChangeRequestStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingPending) {
      throw new BadRequestException('Pending change request already exists');
    }

    const request = await this.prisma.bookingChangeRequest.create({
      data: {
        bookingId,
        requestedDate: parseBookingDateInput(dto.requestedDate),
        reason: dto.reason,
      },
    });

    await this.notificationsService.createForUser({
      userId,
      type: NotificationType.BOOKING_CHANGE_REQUESTED,
      title: 'Date change request submitted',
      body: `Your date change request for booking ${bookingId} is pending.`,
      metadata: { bookingId, changeRequestId: request.id },
    });

    return request;
  }

  async findAllAdmin(query: AdminBookingsQueryDto) {
    return this.adminReadService.findAllAdmin(query);
  }

  async findTrashAdmin(query: AdminBookingsQueryDto) {
    return this.adminReadService.findTrashAdmin(query);
  }

  async createAdmin(dto: AdminCreateBookingDto) {
    return this.adminMutationService.createAdmin(dto);
  }

  async findOneAdmin(id: string) {
    return this.adminReadService.findOneAdmin(id);
  }

  async updateAdmin(id: string, dto: AdminUpdateBookingDto) {
    return this.adminMutationService.updateAdmin(id, dto);
  }

  async deleteAdmin(id: string) {
    return this.adminMutationService.deleteAdmin(id);
  }

  async restoreAdmin(id: string) {
    return this.adminMutationService.restoreAdmin(id);
  }

  async permanentDeleteAdmin(id: string) {
    return this.adminMutationService.permanentDeleteAdmin(id);
  }

  async getInvoice(id: string) {
    return this.adminReadService.getInvoice(id);
  }

  async getRevenueSummary(query: AdminRevenueQueryDto) {
    return this.adminReadService.getRevenueSummary(query);
  }

  async approveBooking(id: string, dto: AdminBookingDecisionDto) {
    return this.approvalService.approveBooking(id, dto);
  }

  async rejectBooking(id: string, dto: AdminBookingDecisionDto) {
    return this.approvalService.rejectBooking(id, dto);
  }

  async approveChangeRequest(id: string, dto: AdminBookingDecisionDto) {
    return this.approvalService.approveChangeRequest(id, dto);
  }

  async rejectChangeRequest(id: string, dto: AdminBookingDecisionDto) {
    return this.approvalService.rejectChangeRequest(id, dto);
  }

  async getCalendar(month: string) {
    return this.adminReadService.getCalendar(month);
  }
}
