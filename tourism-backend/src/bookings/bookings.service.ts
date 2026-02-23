import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingChangeRequestStatus,
  BookingServiceStatus,
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
import { AdminRevenueQueryDto } from './dto/admin-revenue-query.dto';

const BOOKING_ADMIN_INCLUDE = {
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
} as const;

const INVOICE_LOGO_URL =
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771052061/vibe-logo_kztwbw.png';

type AdminBookingRecord = Prisma.BookingGetPayload<{
  include: typeof BOOKING_ADMIN_INCLUDE;
}>;

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

function toMonthKey(value: Date): string {
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthToUtcStart(value: string): Date {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new BadRequestException('Invalid month format. Use YYYY-MM.');
  }

  const [year, month] = value.split('-').map(Number);
  const monthIndex = month - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    throw new BadRequestException('Invalid month format. Use YYYY-MM.');
  }

  return new Date(Date.UTC(year, monthIndex, 1));
}

function addMonthUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function normalizeNullableString(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeAmount(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function withBalance<T extends { totalPrice: number; amountPaid: number }>(record: T) {
  return {
    ...record,
    balanceDue: safeAmount(record.totalPrice) - safeAmount(record.amountPaid),
  };
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  private async findAdminBookingOrThrow(id: string): Promise<AdminBookingRecord> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_ADMIN_INCLUDE,
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  private async validateTourExists(tourId: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id: tourId },
      select: { id: true },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }
  }

  private async validateUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private parseHotelDates(input: {
    checkIn?: string | null;
    checkOut?: string | null;
  }): { checkIn: Date | null; checkOut: Date | null } {
    const checkIn = input.checkIn ? parseBookingDateInput(input.checkIn) : null;
    const checkOut = input.checkOut ? parseBookingDateInput(input.checkOut) : null;

    if (checkIn && checkOut && checkOut < checkIn) {
      throw new BadRequestException('Hotel check-out date must be after check-in date');
    }

    return { checkIn, checkOut };
  }

  private mapBooking(record: AdminBookingRecord) {
    return withBalance(record);
  }

  private mapBookings(records: AdminBookingRecord[]) {
    return records.map((record) => this.mapBooking(record));
  }

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

  async findAllAdmin(query: AdminBookingsQueryDto) {
    const where: Prisma.BookingWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.serviceStatus ? { serviceStatus: query.serviceStatus } : {}),
      ...(query.tourId ? { tourId: query.tourId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };

    if (query.dateFrom || query.dateTo) {
      where.desiredDate = {
        ...(query.dateFrom ? { gte: dateOnlyToUtc(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: dateOnlyToUtc(query.dateTo) } : {}),
      };
    }

    const records = await this.prisma.booking.findMany({
      where,
      include: BOOKING_ADMIN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return this.mapBookings(records);
  }

  async createAdmin(dto: AdminCreateBookingDto) {
    const hasTour = Boolean(dto.tourId);
    const hasHotel =
      hasText(dto.hotelName) ||
      Boolean(dto.hotelCheckIn) ||
      Boolean(dto.hotelCheckOut) ||
      hasText(dto.hotelRoomType) ||
      dto.hotelGuests !== undefined ||
      hasText(dto.hotelNotes);

    if (!hasTour && !hasHotel) {
      throw new BadRequestException('At least one service (tour or hotel) is required');
    }

    const guestName = normalizeNullableString(dto.guestName);
    const guestEmail = normalizeNullableString(dto.guestEmail);
    const guestPhone = normalizeNullableString(dto.guestPhone);

    if (!dto.userId && !guestName && !guestEmail && !guestPhone) {
      throw new BadRequestException('Provide either an existing user or guest details');
    }

    if (dto.userId) {
      await this.validateUserExists(dto.userId);
    }

    if (hasTour && dto.tourId) {
      await this.validateTourExists(dto.tourId);
    }

    if (hasTour && !dto.desiredDate) {
      throw new BadRequestException('Tour date is required when tour service is provided');
    }

    const hotelName = hasHotel ? normalizeNullableString(dto.hotelName) : null;

    if (hasHotel && !hotelName) {
      throw new BadRequestException('Hotel name is required when hotel service is provided');
    }

    const { checkIn: hotelCheckIn, checkOut: hotelCheckOut } = this.parseHotelDates({
      checkIn: dto.hotelCheckIn,
      checkOut: dto.hotelCheckOut,
    });

    const totalPrice = safeAmount(dto.totalPrice);
    const amountPaid = safeAmount(dto.amountPaid);

    if (totalPrice < 0 || amountPaid < 0) {
      throw new BadRequestException('Price values must be greater than or equal to 0');
    }

    const status = dto.status ?? BookingStatus.APPROVED;
    const decisionTimestamp = new Date();

    const record = await this.prisma.booking.create({
      data: {
        userId: dto.userId ?? null,
        guestName,
        guestEmail,
        guestPhone,
        tourId: hasTour ? dto.tourId ?? null : null,
        desiredDate: hasTour && dto.desiredDate ? parseBookingDateInput(dto.desiredDate) : null,
        adults: hasTour ? dto.adults ?? 1 : null,
        children: hasTour ? dto.children ?? 0 : null,
        roomType: hasTour ? dto.roomType ?? RoomType.double : null,
        hotelName,
        hotelCheckIn,
        hotelCheckOut,
        hotelRoomType: hasHotel ? normalizeNullableString(dto.hotelRoomType) : null,
        hotelGuests: hasHotel ? dto.hotelGuests ?? null : null,
        hotelNotes: hasHotel ? normalizeNullableString(dto.hotelNotes) : null,
        totalPrice,
        amountPaid,
        note: normalizeNullableString(dto.note),
        adminNote: normalizeNullableString(dto.adminNote),
        serviceStatus: dto.serviceStatus ?? ('PENDING' as BookingServiceStatus),
        status,
        approvedAt: status === BookingStatus.APPROVED ? decisionTimestamp : null,
        rejectedAt: status === BookingStatus.REJECTED ? decisionTimestamp : null,
        cancelledAt: status === BookingStatus.CANCELLED ? decisionTimestamp : null,
      },
      include: BOOKING_ADMIN_INCLUDE,
    });

    return this.mapBooking(record);
  }

  async findOneAdmin(id: string) {
    const booking = await this.findAdminBookingOrThrow(id);
    return this.mapBooking(booking);
  }

  async updateAdmin(id: string, dto: AdminUpdateBookingDto) {
    const existing = await this.findAdminBookingOrThrow(id);

    const nextUserId = dto.userId !== undefined ? dto.userId : existing.userId;
    if (nextUserId) {
      await this.validateUserExists(nextUserId);
    }

    const nextGuestName =
      dto.guestName !== undefined ? normalizeNullableString(dto.guestName) : existing.guestName;
    const nextGuestEmail =
      dto.guestEmail !== undefined ? normalizeNullableString(dto.guestEmail) : existing.guestEmail;
    const nextGuestPhone =
      dto.guestPhone !== undefined ? normalizeNullableString(dto.guestPhone) : existing.guestPhone;

    if (!nextUserId && !nextGuestName && !nextGuestEmail && !nextGuestPhone) {
      throw new BadRequestException('Provide either an existing user or guest details');
    }

    const nextTourId = dto.tourId !== undefined ? dto.tourId : existing.tourId;

    let nextDesiredDate = existing.desiredDate;
    if (dto.desiredDate !== undefined) {
      nextDesiredDate = dto.desiredDate ? parseBookingDateInput(dto.desiredDate) : null;
    }

    let nextAdults = dto.adults !== undefined ? dto.adults : existing.adults;
    let nextChildren = dto.children !== undefined ? dto.children : existing.children;
    let nextRoomType = dto.roomType !== undefined ? dto.roomType : existing.roomType;

    const incomingHotelName =
      dto.hotelName !== undefined ? normalizeNullableString(dto.hotelName) : existing.hotelName;

    let nextHotelCheckIn = existing.hotelCheckIn;
    if (dto.hotelCheckIn !== undefined) {
      nextHotelCheckIn = dto.hotelCheckIn ? parseBookingDateInput(dto.hotelCheckIn) : null;
    }

    let nextHotelCheckOut = existing.hotelCheckOut;
    if (dto.hotelCheckOut !== undefined) {
      nextHotelCheckOut = dto.hotelCheckOut ? parseBookingDateInput(dto.hotelCheckOut) : null;
    }

    const nextHotelRoomType =
      dto.hotelRoomType !== undefined
        ? normalizeNullableString(dto.hotelRoomType)
        : existing.hotelRoomType;
    const nextHotelGuests = dto.hotelGuests !== undefined ? dto.hotelGuests : existing.hotelGuests;
    const nextHotelNotes =
      dto.hotelNotes !== undefined ? normalizeNullableString(dto.hotelNotes) : existing.hotelNotes;

    const hasTour = Boolean(nextTourId);
    const hasHotel =
      Boolean(incomingHotelName) ||
      Boolean(nextHotelCheckIn) ||
      Boolean(nextHotelCheckOut) ||
      Boolean(nextHotelRoomType) ||
      nextHotelGuests !== null;

    if (!hasTour && !hasHotel) {
      throw new BadRequestException('At least one service (tour or hotel) is required');
    }

    if (hasTour && nextTourId) {
      await this.validateTourExists(nextTourId);
    }

    if (hasTour && !nextDesiredDate) {
      throw new BadRequestException('Tour date is required when tour service is provided');
    }

    if (hasTour && (nextAdults === null || nextAdults === undefined)) {
      nextAdults = 1;
    }

    if (hasTour && (nextChildren === null || nextChildren === undefined)) {
      nextChildren = 0;
    }

    if (hasTour && !nextRoomType) {
      nextRoomType = RoomType.double;
    }

    if (!hasTour) {
      nextDesiredDate = null;
      nextAdults = null;
      nextChildren = null;
      nextRoomType = null;
    }

    if (hasHotel && !incomingHotelName) {
      throw new BadRequestException('Hotel name is required when hotel service is provided');
    }

    if (nextHotelCheckIn && nextHotelCheckOut && nextHotelCheckOut < nextHotelCheckIn) {
      throw new BadRequestException('Hotel check-out date must be after check-in date');
    }

    const hotelName = hasHotel ? incomingHotelName : null;

    const totalPrice =
      dto.totalPrice !== undefined ? safeAmount(dto.totalPrice) : safeAmount(existing.totalPrice);
    const amountPaid =
      dto.amountPaid !== undefined ? safeAmount(dto.amountPaid) : safeAmount(existing.amountPaid);

    if (totalPrice < 0 || amountPaid < 0) {
      throw new BadRequestException('Price values must be greater than or equal to 0');
    }

    const updateData: Prisma.BookingUncheckedUpdateInput = {
      userId: nextUserId ?? null,
      guestName: nextGuestName,
      guestEmail: nextGuestEmail,
      guestPhone: nextGuestPhone,
      tourId: hasTour ? nextTourId ?? null : null,
      desiredDate: hasTour ? nextDesiredDate : null,
      adults: hasTour ? nextAdults : null,
      children: hasTour ? nextChildren : null,
      roomType: hasTour ? (nextRoomType as RoomType) : null,
      hotelName,
      hotelCheckIn: hasHotel ? nextHotelCheckIn : null,
      hotelCheckOut: hasHotel ? nextHotelCheckOut : null,
      hotelRoomType: hasHotel ? nextHotelRoomType : null,
      hotelGuests: hasHotel ? nextHotelGuests : null,
      hotelNotes: hasHotel ? nextHotelNotes : null,
      totalPrice,
      amountPaid,
      status: dto.status ?? existing.status,
      serviceStatus: dto.serviceStatus ?? existing.serviceStatus,
      adminNote:
        dto.adminNote !== undefined ? normalizeNullableString(dto.adminNote) : existing.adminNote,
    };

    const updated = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: BOOKING_ADMIN_INCLUDE,
    });

    return this.mapBooking(updated);
  }

  async deleteAdmin(id: string) {
    await this.findAdminBookingOrThrow(id);

    await this.prisma.booking.delete({ where: { id } });

    return {
      deleted: true,
      id,
    };
  }

  async getInvoice(id: string) {
    const booking = await this.findAdminBookingOrThrow(id);
    const withTotals = this.mapBooking(booking);

    return {
      logoUrl: INVOICE_LOGO_URL,
      bookingId: booking.id,
      issuedAt: new Date().toISOString(),
      customer: {
        name:
          booking.user
            ? `${booking.user.firstName} ${booking.user.lastName}`
            : booking.guestName || 'Guest customer',
        email: booking.user?.email || booking.guestEmail || null,
        phone: booking.user?.phone || booking.guestPhone || null,
      },
      services: {
        tour: booking.tour
          ? {
              id: booking.tour.id,
              slug: booking.tour.slug,
              title_ka: booking.tour.title_ka,
              title_en: booking.tour.title_en,
              title_ru: booking.tour.title_ru,
              desiredDate: booking.desiredDate,
              adults: booking.adults,
              children: booking.children,
              roomType: booking.roomType,
            }
          : null,
        hotel: booking.hotelName
          ? {
              name: booking.hotelName,
              checkIn: booking.hotelCheckIn,
              checkOut: booking.hotelCheckOut,
              roomType: booking.hotelRoomType,
              guests: booking.hotelGuests,
              notes: booking.hotelNotes,
            }
          : null,
      },
      financials: {
        totalPrice: withTotals.totalPrice,
        amountPaid: withTotals.amountPaid,
        balanceDue: withTotals.balanceDue,
      },
      admin: {
        note: booking.adminNote,
        serviceStatus: booking.serviceStatus,
        bookingStatus: booking.status,
      },
    };
  }

  async getRevenueSummary(query: AdminRevenueQueryDto) {
    const fromStart = query.fromMonth ? monthToUtcStart(query.fromMonth) : null;
    const toStart = query.toMonth ? monthToUtcStart(query.toMonth) : null;

    if (fromStart && toStart && toStart < fromStart) {
      throw new BadRequestException('toMonth must be after fromMonth');
    }

    const where: Prisma.BookingWhereInput = {
      ...(fromStart || toStart
        ? {
            createdAt: {
              ...(fromStart ? { gte: fromStart } : {}),
              ...(toStart ? { lt: addMonthUtc(toStart) } : {}),
            },
          }
        : {}),
    };

    const rows = await this.prisma.booking.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        amountPaid: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap = new Map<
      string,
      { month: string; bookings: number; totalRevenue: number; totalPaid: number; totalBalance: number }
    >();

    for (const row of rows) {
      const month = toMonthKey(row.createdAt);
      const existing = monthMap.get(month) || {
        month,
        bookings: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalBalance: 0,
      };

      const totalRevenue = safeAmount(row.totalPrice);
      const totalPaid = safeAmount(row.amountPaid);

      existing.bookings += 1;
      existing.totalRevenue += totalRevenue;
      existing.totalPaid += totalPaid;
      existing.totalBalance += totalRevenue - totalPaid;

      monthMap.set(month, existing);
    }

    const items = Array.from(monthMap.values());

    return {
      range: {
        fromMonth: query.fromMonth || null,
        toMonth: query.toMonth || null,
      },
      totals: {
        bookings: items.reduce((sum, item) => sum + item.bookings, 0),
        totalRevenue: items.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalPaid: items.reduce((sum, item) => sum + item.totalPaid, 0),
        totalBalance: items.reduce((sum, item) => sum + item.totalBalance, 0),
      },
      items,
    };
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

    if (booking.userId) {
      await this.notificationsService.createForUser({
        userId: booking.userId,
        type: NotificationType.BOOKING_APPROVED,
        title: 'Booking approved',
        body: `Booking ${booking.id} was approved.`,
        metadata: { bookingId: booking.id },
      });
    }

    if (booking.user?.email) {
      await this.emailService.sendBookingDecisionEmail({
        recipientEmail: booking.user.email,
        bookingId: booking.id,
        decision: 'approved',
        adminNote: dto.adminNote,
      });
    }

    return withBalance(updated);
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

    if (booking.userId) {
      await this.notificationsService.createForUser({
        userId: booking.userId,
        type: NotificationType.BOOKING_REJECTED,
        title: 'Booking rejected',
        body: `Booking ${booking.id} was rejected.`,
        metadata: { bookingId: booking.id },
      });
    }

    if (booking.user?.email) {
      await this.emailService.sendBookingDecisionEmail({
        recipientEmail: booking.user.email,
        bookingId: booking.id,
        decision: 'rejected',
        adminNote: dto.adminNote,
      });
    }

    return withBalance(updated);
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

    if (changeRequest.booking.userId) {
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
    }

    if (changeRequest.booking.user?.email) {
      await this.emailService.sendBookingChangeDecisionEmail({
        recipientEmail: changeRequest.booking.user.email,
        bookingId: changeRequest.bookingId,
        requestedDate: toDateOnly(changeRequest.requestedDate),
        decision: 'approved',
        adminNote: dto.adminNote,
      });
    }

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

    if (changeRequest.booking.userId) {
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
    }

    if (changeRequest.booking.user?.email) {
      await this.emailService.sendBookingChangeDecisionEmail({
        recipientEmail: changeRequest.booking.user.email,
        bookingId: changeRequest.bookingId,
        requestedDate: toDateOnly(changeRequest.requestedDate),
        decision: 'rejected',
        adminNote: dto.adminNote,
      });
    }

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
      if (!booking.desiredDate) {
        continue;
      }

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
