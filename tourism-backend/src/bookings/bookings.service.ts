import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingChangeRequestStatus,
  BookingStatus,
  NotificationType,
  Prisma,
  RoomType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateBookingChangeRequestDto } from './dto/create-booking-change-request.dto';
import { AdminUpdateBookingDto } from './dto/admin-update-booking.dto';
import { AdminBookingDecisionDto } from './dto/admin-booking-decision.dto';
import { AdminBookingsQueryDto } from './dto/admin-bookings-query.dto';
import { AdminCreateBookingDto } from './dto/admin-create-booking.dto';

function dateOnlyToUtc(dateOnly: string): Date {
  const normalized = `${dateOnly}T00:00:00.000Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Invalid date format');
  }

  return parsed;
}

function parseBookingDateInput(value: string): Date {
  const input = String(value || '').trim();

  if (!input) {
    throw new BadRequestException('Invalid date format');
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return dateOnlyToUtc(input);
  }

  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Invalid date format');
  }

  return parsed;
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const tour = await this.prisma.tour.findUnique({
      where: { id: dto.tourId },
      select: {
        id: true,
        status: true,
        title_en: true,
        title_ka: true,
        title_ru: true,
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

    await this.emailService.sendBookingCreatedEmail({
      recipientEmail: booking.user.email,
      bookingId: booking.id,
      tourTitle: booking.tour.title_en,
      desiredDate: toDateOnly(booking.desiredDate),
    });

    return booking;
  }

  findMy(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
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

    if (!booking || booking.userId !== userId) {
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

    if (!booking || booking.userId !== userId) {
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

    await this.emailService.sendBookingDecisionEmail({
      recipientEmail: booking.user.email,
      bookingId: booking.id,
      decision: 'cancelled',
    });

    return updated;
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
      },
    });

    if (!booking || booking.userId !== userId) {
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

  findAllAdmin(query: AdminBookingsQueryDto) {
    const where: Prisma.BookingWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.tourId ? { tourId: query.tourId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };

    if (query.dateFrom || query.dateTo) {
      where.desiredDate = {
        ...(query.dateFrom ? { gte: dateOnlyToUtc(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: dateOnlyToUtc(query.dateTo) } : {}),
      };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
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

  async createAdmin(dto: AdminCreateBookingDto) {
    const [user, tour] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.userId },
        select: { id: true },
      }),
      this.prisma.tour.findUnique({
        where: { id: dto.tourId },
        select: { id: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    const status = dto.status ?? BookingStatus.APPROVED;
    const decisionTimestamp = new Date();

    return this.prisma.booking.create({
      data: {
        userId: dto.userId,
        tourId: dto.tourId,
        desiredDate: parseBookingDateInput(dto.desiredDate),
        adults: dto.adults,
        children: dto.children,
        roomType: dto.roomType,
        note: dto.note?.trim() || undefined,
        adminNote: dto.adminNote?.trim() || undefined,
        status,
        approvedAt: status === BookingStatus.APPROVED ? decisionTimestamp : null,
        rejectedAt: status === BookingStatus.REJECTED ? decisionTimestamp : null,
        cancelledAt: status === BookingStatus.CANCELLED ? decisionTimestamp : null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
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
  }

  async findOneAdmin(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
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

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateAdmin(id: string, dto: AdminUpdateBookingDto) {
    await this.findOneAdmin(id);

    const updateData: Prisma.BookingUpdateInput = {
      ...(dto.desiredDate ? { desiredDate: parseBookingDateInput(dto.desiredDate) } : {}),
      ...(dto.adults !== undefined ? { adults: dto.adults } : {}),
      ...(dto.children !== undefined ? { children: dto.children } : {}),
      ...(dto.roomType ? { roomType: dto.roomType as RoomType } : {}),
      ...(dto.adminNote !== undefined ? { adminNote: dto.adminNote } : {}),
    };

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        tour: {
          select: {
            id: true,
            slug: true,
            title_ka: true,
            title_en: true,
            title_ru: true,
          },
        },
      },
    });
  }

  async approveBooking(id: string, dto: AdminBookingDecisionDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be approved');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.APPROVED,
        approvedAt: new Date(),
        rejectedAt: null,
        adminNote: dto.adminNote,
      },
    });

    await this.notificationsService.createForUser({
      userId: booking.userId,
      type: NotificationType.BOOKING_APPROVED,
      title: 'Booking approved',
      body: `Booking ${booking.id} was approved.`,
      metadata: { bookingId: booking.id },
    });

    await this.emailService.sendBookingDecisionEmail({
      recipientEmail: booking.user.email,
      bookingId: booking.id,
      decision: 'approved',
      adminNote: dto.adminNote,
    });

    return updated;
  }

  async rejectBooking(id: string, dto: AdminBookingDecisionDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be rejected');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.REJECTED,
        rejectedAt: new Date(),
        approvedAt: null,
        adminNote: dto.adminNote,
      },
    });

    await this.notificationsService.createForUser({
      userId: booking.userId,
      type: NotificationType.BOOKING_REJECTED,
      title: 'Booking rejected',
      body: `Booking ${booking.id} was rejected.`,
      metadata: { bookingId: booking.id },
    });

    await this.emailService.sendBookingDecisionEmail({
      recipientEmail: booking.user.email,
      bookingId: booking.id,
      decision: 'rejected',
      adminNote: dto.adminNote,
    });

    return updated;
  }

  async approveChangeRequest(id: string, dto: AdminBookingDecisionDto) {
    const changeRequest = await this.prisma.bookingChangeRequest.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!changeRequest) {
      throw new NotFoundException('Change request not found');
    }

    if (changeRequest.status !== BookingChangeRequestStatus.PENDING) {
      throw new BadRequestException('Change request is already resolved');
    }

    if (
      changeRequest.booking.status === BookingStatus.CANCELLED ||
      changeRequest.booking.status === BookingStatus.REJECTED
    ) {
      throw new BadRequestException('Cannot update a closed booking');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: changeRequest.bookingId },
        data: {
          desiredDate: changeRequest.requestedDate,
          adminNote: dto.adminNote,
        },
      });

      const updatedRequest = await tx.bookingChangeRequest.update({
        where: { id },
        data: {
          status: BookingChangeRequestStatus.APPROVED,
          resolvedAt: new Date(),
          adminNote: dto.adminNote,
        },
      });

      return {
        booking: updatedBooking,
        changeRequest: updatedRequest,
      };
    });

    await this.notificationsService.createForUser({
      userId: changeRequest.booking.userId,
      type: NotificationType.BOOKING_CHANGE_APPROVED,
      title: 'Date change approved',
      body: `Date change for booking ${changeRequest.bookingId} was approved.`,
      metadata: {
        bookingId: changeRequest.bookingId,
        changeRequestId: changeRequest.id,
      },
    });

    await this.emailService.sendBookingChangeDecisionEmail({
      recipientEmail: changeRequest.booking.user.email,
      bookingId: changeRequest.bookingId,
      requestedDate: toDateOnly(changeRequest.requestedDate),
      decision: 'approved',
      adminNote: dto.adminNote,
    });

    return result;
  }

  async rejectChangeRequest(id: string, dto: AdminBookingDecisionDto) {
    const changeRequest = await this.prisma.bookingChangeRequest.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!changeRequest) {
      throw new NotFoundException('Change request not found');
    }

    if (changeRequest.status !== BookingChangeRequestStatus.PENDING) {
      throw new BadRequestException('Change request is already resolved');
    }

    const updatedRequest = await this.prisma.bookingChangeRequest.update({
      where: { id },
      data: {
        status: BookingChangeRequestStatus.REJECTED,
        resolvedAt: new Date(),
        adminNote: dto.adminNote,
      },
    });

    await this.notificationsService.createForUser({
      userId: changeRequest.booking.userId,
      type: NotificationType.BOOKING_CHANGE_REJECTED,
      title: 'Date change rejected',
      body: `Date change for booking ${changeRequest.bookingId} was rejected.`,
      metadata: {
        bookingId: changeRequest.bookingId,
        changeRequestId: changeRequest.id,
      },
    });

    await this.emailService.sendBookingChangeDecisionEmail({
      recipientEmail: changeRequest.booking.user.email,
      bookingId: changeRequest.bookingId,
      requestedDate: toDateOnly(changeRequest.requestedDate),
      decision: 'rejected',
      adminNote: dto.adminNote,
    });

    return updatedRequest;
  }

  async getCalendar(month: string) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const [year, monthValue] = month.split('-').map(Number);
    const monthIndex = monthValue - 1;

    if (monthIndex < 0 || monthIndex > 11) {
      throw new BadRequestException('month must be in YYYY-MM format');
    }

    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 1));

    const [approvedBookings, allBookings] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          status: BookingStatus.APPROVED,
          desiredDate: {
            gte: start,
            lt: end,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          tour: {
            select: {
              id: true,
              slug: true,
              title_ka: true,
              title_en: true,
              title_ru: true,
            },
          },
        },
        orderBy: { desiredDate: 'asc' },
      }),
      this.prisma.booking.findMany({
        where: {
          desiredDate: {
            gte: start,
            lt: end,
          },
        },
        select: {
          status: true,
        },
      }),
    ]);

    const dayMap = new Map<string, any[]>();

    for (const booking of approvedBookings) {
      const key = toDateOnly(booking.desiredDate);
      const existing = dayMap.get(key) || [];
      existing.push(booking);
      dayMap.set(key, existing);
    }

    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(Date.UTC(year, monthIndex, index + 1));
      const key = toDateOnly(date);
      const bookings = dayMap.get(key) || [];

      return {
        date: key,
        bookingCount: bookings.length,
        bookings,
      };
    });

    const summary = {
      total: allBookings.length,
      approved: allBookings.filter((item) => item.status === BookingStatus.APPROVED).length,
      pending: allBookings.filter((item) => item.status === BookingStatus.PENDING).length,
      rejected: allBookings.filter((item) => item.status === BookingStatus.REJECTED).length,
      cancelled: allBookings.filter((item) => item.status === BookingStatus.CANCELLED).length,
    };

    return {
      month,
      summary,
      days,
    };
  }
}
