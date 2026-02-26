import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingChangeRequestStatus,
  CarType,
  BookingServiceStatus,
  BookingStatus,
  Currency,
  NotificationType,
  PaymentAmountMode,
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
import {
  AdminBookingHotelServiceDto,
  AdminBookingTourDto,
} from './dto/admin-create-booking.dto';

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
  tours: {
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
    },
    orderBy: { createdAt: 'asc' },
  },
  hotelService: {
    include: {
      hotel: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      rooms: {
        orderBy: { createdAt: 'asc' },
      },
    },
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

function normalizePercent(value: number | null | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new BadRequestException('Percent value must be between 0 and 100');
  }

  return value;
}

type NormalizedTourService = {
  tourId: string;
  desiredDate: Date;
  adults: number;
  children: number;
  carType: CarType;
};

type NormalizedHotelRoom = {
  roomType: string;
  guestCount: number;
};

type NormalizedHotelService = {
  hotelId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  notes: string | null;
  sendRequestToHotel: boolean;
  rooms: NormalizedHotelRoom[];
};

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

  private async findHotelOrThrow(hotelId: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    return hotel;
  }

  private toNormalizedTours(
    tours?: AdminBookingTourDto[] | null,
    fallback?: {
      tourId?: string | null;
      desiredDate?: string | null;
      adults?: number | null;
      children?: number | null;
    },
  ): NormalizedTourService[] {
    if (Array.isArray(tours) && tours.length > 0) {
      return tours.map((item) => ({
        tourId: item.tourId,
        desiredDate: parseBookingDateInput(item.desiredDate),
        adults: item.adults,
        children: item.children,
        carType: item.carType,
      }));
    }

    if (fallback?.tourId && fallback?.desiredDate) {
      return [
        {
          tourId: fallback.tourId,
          desiredDate: parseBookingDateInput(fallback.desiredDate),
          adults: fallback.adults ?? 1,
          children: fallback.children ?? 0,
          carType: CarType.SEDAN,
        },
      ];
    }

    return [];
  }

  private toNormalizedHotelService(
    hotelService?: AdminBookingHotelServiceDto | null,
    fallback?: {
      hotelName?: string | null;
      hotelCheckIn?: string | null;
      hotelCheckOut?: string | null;
      hotelRoomType?: string | null;
      hotelGuests?: number | null;
      hotelNotes?: string | null;
    },
  ): {
    hotelService: NormalizedHotelService | null;
    fallbackHotelName: string | null;
  } {
    if (hotelService) {
      const { checkIn, checkOut } = this.parseHotelDates({
        checkIn: hotelService.checkIn,
        checkOut: hotelService.checkOut,
      });

      const rooms = (hotelService.rooms || [])
        .map((room) => ({
          roomType: room.roomType.trim(),
          guestCount: room.guestCount,
        }))
        .filter((room) => room.roomType.length > 0);

      return {
        hotelService: {
          hotelId: hotelService.hotelId,
          checkIn,
          checkOut,
          notes: normalizeNullableString(hotelService.notes),
          sendRequestToHotel: Boolean(hotelService.sendRequestToHotel),
          rooms: rooms.length > 0 ? rooms : [{ roomType: 'Standard', guestCount: 1 }],
        },
        fallbackHotelName: null,
      };
    }

    const hasLegacyHotel =
      hasText(fallback?.hotelName) ||
      Boolean(fallback?.hotelCheckIn) ||
      Boolean(fallback?.hotelCheckOut) ||
      hasText(fallback?.hotelRoomType) ||
      fallback?.hotelGuests !== undefined;

    if (!hasLegacyHotel) {
      return {
        hotelService: null,
        fallbackHotelName: null,
      };
    }

    if (!hasText(fallback?.hotelName)) {
      throw new BadRequestException('Hotel name is required when hotel service is provided');
    }

    const { checkIn, checkOut } = this.parseHotelDates({
      checkIn: fallback?.hotelCheckIn ?? null,
      checkOut: fallback?.hotelCheckOut ?? null,
    });

    return {
      hotelService: null,
      fallbackHotelName: normalizeNullableString(fallback?.hotelName),
    };
  }

  private resolvePaidAmounts(params: {
    totalPrice: number;
    amountPaid?: number;
    amountPaidMode?: PaymentAmountMode;
    amountPaidPercent?: number | null;
    fallback?: {
      amountPaid: number;
      amountPaidMode: PaymentAmountMode;
      amountPaidPercent: number | null;
    };
  }) {
    const totalPrice = safeAmount(params.totalPrice);
    const mode =
      params.amountPaidMode ??
      params.fallback?.amountPaidMode ??
      PaymentAmountMode.FLAT;

    if (mode === PaymentAmountMode.PERCENT) {
      const percent = normalizePercent(
        params.amountPaidPercent ?? params.fallback?.amountPaidPercent ?? 0,
      );
      const amountPaid = (totalPrice * (percent ?? 0)) / 100;

      return {
        totalPrice,
        amountPaid,
        amountPaidMode: mode,
        amountPaidPercent: percent,
      };
    }

    const amountPaid = safeAmount(
      params.amountPaid ?? params.fallback?.amountPaid ?? 0,
    );

    return {
      totalPrice,
      amountPaid,
      amountPaidMode: mode,
      amountPaidPercent: params.amountPaidPercent ?? params.fallback?.amountPaidPercent ?? null,
    };
  }

  private getLegacySummaryFromTours(tours: NormalizedTourService[]) {
    if (tours.length === 0) {
      return {
        tourId: null,
        desiredDate: null,
        adults: null,
        children: null,
      };
    }

    const firstTour = tours[0];

    return {
      tourId: firstTour.tourId,
      desiredDate: firstTour.desiredDate,
      adults: firstTour.adults,
      children: firstTour.children,
    };
  }

  private getLegacySummaryFromHotel(params: {
    hotelName?: string | null;
    hotelCheckIn?: Date | null;
    hotelCheckOut?: Date | null;
    hotelNotes?: string | null;
    hotelRoomType?: string | null;
    hotelGuests?: number | null;
    normalizedHotel?: NormalizedHotelService | null;
    resolvedHotelName?: string | null;
  }) {
    const firstRoom = params.normalizedHotel?.rooms?.[0];

    return {
      hotelName: params.resolvedHotelName ?? params.hotelName ?? null,
      hotelCheckIn: params.normalizedHotel?.checkIn ?? params.hotelCheckIn ?? null,
      hotelCheckOut: params.normalizedHotel?.checkOut ?? params.hotelCheckOut ?? null,
      hotelRoomType: firstRoom?.roomType ?? params.hotelRoomType ?? null,
      hotelGuests: firstRoom?.guestCount ?? params.hotelGuests ?? null,
      hotelNotes: params.normalizedHotel?.notes ?? params.hotelNotes ?? null,
    };
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
    const where: Prisma.BookingWhereInput = {
      isDeleted: false,
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

  async findTrashAdmin(query: AdminBookingsQueryDto) {
    const where: Prisma.BookingWhereInput = {
      isDeleted: true,
      ...(query.status ? { status: query.status } : {}),
      ...(query.serviceStatus ? { serviceStatus: query.serviceStatus } : {}),
      ...(query.tourId ? { tourId: query.tourId } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };

    if (query.dateFrom || query.dateTo) {
      where.deletedAt = {
        ...(query.dateFrom ? { gte: dateOnlyToUtc(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: dateOnlyToUtc(query.dateTo) } : {}),
      };
    }

    const records = await this.prisma.booking.findMany({
      where,
      include: BOOKING_ADMIN_INCLUDE,
      orderBy: { deletedAt: 'desc' },
    });

    return this.mapBookings(records);
  }

  async createAdmin(dto: AdminCreateBookingDto) {
    const guestName = normalizeNullableString(dto.guestName);
    const guestEmail = normalizeNullableString(dto.guestEmail);
    const guestPhone = normalizeNullableString(dto.guestPhone);

    if (!dto.userId && !guestName && !guestEmail && !guestPhone) {
      throw new BadRequestException('Provide either an existing user or guest details');
    }

    if (dto.userId) {
      await this.validateUserExists(dto.userId);
    }

    const normalizedTours = this.toNormalizedTours(dto.tours, {
      tourId: dto.tourId,
      desiredDate: dto.desiredDate,
      adults: dto.adults,
      children: dto.children,
    });

    for (const tourItem of normalizedTours) {
      await this.validateTourExists(tourItem.tourId);
    }

    const normalizedHotelResult = this.toNormalizedHotelService(dto.hotelService, {
      hotelName: dto.hotelName,
      hotelCheckIn: dto.hotelCheckIn,
      hotelCheckOut: dto.hotelCheckOut,
      hotelRoomType: dto.hotelRoomType,
      hotelGuests: dto.hotelGuests,
      hotelNotes: dto.hotelNotes,
    });

    let normalizedHotel = normalizedHotelResult.hotelService;
    let resolvedHotel = null as Awaited<ReturnType<BookingsService['findHotelOrThrow']>> | null;
    let resolvedHotelName = normalizedHotelResult.fallbackHotelName;

    if (normalizedHotel) {
      resolvedHotel = await this.findHotelOrThrow(normalizedHotel.hotelId);
      resolvedHotelName = resolvedHotel.name;
    }

    const hasTour = normalizedTours.length > 0;
    const hasHotel = Boolean(normalizedHotel || resolvedHotelName);

    if (!hasTour && !hasHotel) {
      throw new BadRequestException('At least one service (tour or hotel) is required');
    }

    const legacyTour = this.getLegacySummaryFromTours(normalizedTours);
    const legacyHotel = this.getLegacySummaryFromHotel({
      hotelName: normalizeNullableString(dto.hotelName),
      hotelCheckIn: dto.hotelCheckIn ? parseBookingDateInput(dto.hotelCheckIn) : null,
      hotelCheckOut: dto.hotelCheckOut ? parseBookingDateInput(dto.hotelCheckOut) : null,
      hotelNotes: normalizeNullableString(dto.hotelNotes),
      hotelRoomType: normalizeNullableString(dto.hotelRoomType),
      hotelGuests: dto.hotelGuests ?? null,
      normalizedHotel,
      resolvedHotelName,
    });

    const payment = this.resolvePaidAmounts({
      totalPrice: safeAmount(dto.totalPrice),
      amountPaid: dto.amountPaid,
      amountPaidMode: dto.amountPaidMode,
      amountPaidPercent: dto.amountPaidPercent,
    });

    if (payment.totalPrice < 0 || payment.amountPaid < 0) {
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
        tourId: hasTour ? legacyTour.tourId : null,
        desiredDate: hasTour ? legacyTour.desiredDate : null,
        adults: hasTour ? legacyTour.adults : null,
        children: hasTour ? legacyTour.children : null,
        roomType: hasTour ? dto.roomType ?? RoomType.double : null,
        hotelName: hasHotel ? legacyHotel.hotelName : null,
        hotelCheckIn: hasHotel ? legacyHotel.hotelCheckIn : null,
        hotelCheckOut: hasHotel ? legacyHotel.hotelCheckOut : null,
        hotelRoomType: hasHotel ? legacyHotel.hotelRoomType : null,
        hotelGuests: hasHotel ? legacyHotel.hotelGuests : null,
        hotelNotes: hasHotel ? legacyHotel.hotelNotes : null,
        totalPrice: payment.totalPrice,
        amountPaid: payment.amountPaid,
        currency: dto.currency ?? Currency.GEL,
        amountPaidMode: payment.amountPaidMode,
        amountPaidPercent: payment.amountPaidPercent,
        note: normalizeNullableString(dto.note),
        adminNote: normalizeNullableString(dto.adminNote),
        serviceStatus: dto.serviceStatus ?? ('PENDING' as BookingServiceStatus),
        status,
        approvedAt: status === BookingStatus.APPROVED ? decisionTimestamp : null,
        rejectedAt: status === BookingStatus.REJECTED ? decisionTimestamp : null,
        cancelledAt: status === BookingStatus.CANCELLED ? decisionTimestamp : null,
        ...(normalizedTours.length > 0
          ? {
              tours: {
                create: normalizedTours.map((tourItem) => ({
                  tourId: tourItem.tourId,
                  desiredDate: tourItem.desiredDate,
                  adults: tourItem.adults,
                  children: tourItem.children,
                  carType: tourItem.carType,
                })),
              },
            }
          : {}),
        ...(normalizedHotel
          ? {
              hotelService: {
                create: {
                  hotelId: normalizedHotel.hotelId,
                  checkIn: normalizedHotel.checkIn,
                  checkOut: normalizedHotel.checkOut,
                  notes: normalizedHotel.notes,
                  sendRequestToHotel: normalizedHotel.sendRequestToHotel,
                  rooms: {
                    create: normalizedHotel.rooms.map((room) => ({
                      roomType: room.roomType,
                      guestCount: room.guestCount,
                    })),
                  },
                },
              },
            }
          : {}),
      },
      include: BOOKING_ADMIN_INCLUDE,
    });

    if (normalizedHotel?.sendRequestToHotel && resolvedHotel?.email) {
      await this.emailService.sendHotelInquiryEmail({
        recipientEmail: resolvedHotel.email,
        bookingId: record.id,
        hotelName: resolvedHotel.name,
        guestName:
          guestName ||
          (record.user
            ? `${record.user.firstName} ${record.user.lastName}`.trim()
            : 'Guest customer'),
      });
    }

    return this.mapBooking(record);
  }

  async findOneAdmin(id: string) {
    const booking = await this.findAdminBookingOrThrow(id);
    return this.mapBooking(booking);
  }

  async updateAdmin(id: string, dto: AdminUpdateBookingDto) {
    const existing = await this.findAdminBookingOrThrow(id);

    if (existing.isDeleted) {
      throw new BadRequestException('Cannot update a deleted booking');
    }

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

    const shouldReplaceTours =
      dto.tours !== undefined ||
      dto.tourId !== undefined ||
      dto.desiredDate !== undefined ||
      dto.adults !== undefined ||
      dto.children !== undefined;

    const shouldReplaceHotel =
      dto.hotelService !== undefined ||
      dto.hotelName !== undefined ||
      dto.hotelCheckIn !== undefined ||
      dto.hotelCheckOut !== undefined ||
      dto.hotelRoomType !== undefined ||
      dto.hotelGuests !== undefined ||
      dto.hotelNotes !== undefined;

    let normalizedTours = (existing.tours || []).map((tourItem) => ({
      tourId: tourItem.tourId,
      desiredDate: tourItem.desiredDate,
      adults: tourItem.adults,
      children: tourItem.children,
      carType: tourItem.carType,
    }));

    if (dto.tours !== undefined) {
      normalizedTours = this.toNormalizedTours(dto.tours);
    } else if (shouldReplaceTours) {
      normalizedTours = this.toNormalizedTours(undefined, {
        tourId:
          dto.tourId === undefined
            ? existing.tourId
            : dto.tourId,
        desiredDate:
          dto.desiredDate === undefined
            ? existing.desiredDate
              ? toDateOnly(existing.desiredDate)
              : null
            : dto.desiredDate,
        adults: dto.adults === undefined ? existing.adults : dto.adults,
        children: dto.children === undefined ? existing.children : dto.children,
      });
    } else if (normalizedTours.length === 0 && existing.tourId && existing.desiredDate) {
      normalizedTours = this.toNormalizedTours(undefined, {
        tourId: existing.tourId,
        desiredDate: toDateOnly(existing.desiredDate),
        adults: existing.adults,
        children: existing.children,
      });
    }

    if (dto.tourId === null) {
      normalizedTours = [];
    }

    for (const tourItem of normalizedTours) {
      await this.validateTourExists(tourItem.tourId);
    }

    let normalizedHotel: NormalizedHotelService | null = existing.hotelService
      ? {
          hotelId: existing.hotelService.hotelId,
          checkIn: existing.hotelService.checkIn,
          checkOut: existing.hotelService.checkOut,
          notes: existing.hotelService.notes,
          sendRequestToHotel: existing.hotelService.sendRequestToHotel,
          rooms:
            existing.hotelService.rooms.length > 0
              ? existing.hotelService.rooms.map((room) => ({
                  roomType: room.roomType,
                  guestCount: room.guestCount,
                }))
              : [{ roomType: 'Standard', guestCount: 1 }],
        }
      : null;
    let resolvedHotelName = existing.hotelName;
    let resolvedHotel =
      existing.hotelService?.hotel || null;

    if (dto.hotelService !== undefined) {
      if (dto.hotelService === null) {
        normalizedHotel = null;
        resolvedHotelName = null;
        resolvedHotel = null;
      } else {
        const normalizedHotelResult = this.toNormalizedHotelService(dto.hotelService);
        normalizedHotel = normalizedHotelResult.hotelService;
        if (normalizedHotel) {
          resolvedHotel = await this.findHotelOrThrow(normalizedHotel.hotelId);
          resolvedHotelName = resolvedHotel.name;
        }
      }
    } else if (shouldReplaceHotel) {
      const normalizedHotelResult = this.toNormalizedHotelService(undefined, {
        hotelName:
          dto.hotelName === undefined ? existing.hotelName : dto.hotelName,
        hotelCheckIn:
          dto.hotelCheckIn === undefined
            ? existing.hotelCheckIn
              ? toDateOnly(existing.hotelCheckIn)
              : null
            : dto.hotelCheckIn,
        hotelCheckOut:
          dto.hotelCheckOut === undefined
            ? existing.hotelCheckOut
              ? toDateOnly(existing.hotelCheckOut)
              : null
            : dto.hotelCheckOut,
        hotelRoomType:
          dto.hotelRoomType === undefined ? existing.hotelRoomType : dto.hotelRoomType,
        hotelGuests: dto.hotelGuests === undefined ? existing.hotelGuests : dto.hotelGuests,
        hotelNotes: dto.hotelNotes === undefined ? existing.hotelNotes : dto.hotelNotes,
      });
      normalizedHotel = normalizedHotelResult.hotelService;
      resolvedHotelName = normalizedHotelResult.fallbackHotelName;
      resolvedHotel = null;
    }

    const hasTour = normalizedTours.length > 0;
    const hasHotel = Boolean(normalizedHotel || resolvedHotelName);

    if (!hasTour && !hasHotel) {
      throw new BadRequestException('At least one service (tour or hotel) is required');
    }

    const legacyTour = this.getLegacySummaryFromTours(normalizedTours);
    const legacyHotel = this.getLegacySummaryFromHotel({
      hotelName: existing.hotelName,
      hotelCheckIn: existing.hotelCheckIn,
      hotelCheckOut: existing.hotelCheckOut,
      hotelNotes: existing.hotelNotes,
      hotelRoomType: existing.hotelRoomType,
      hotelGuests: existing.hotelGuests,
      normalizedHotel,
      resolvedHotelName,
    });

    const payment = this.resolvePaidAmounts({
      totalPrice:
        dto.totalPrice !== undefined ? safeAmount(dto.totalPrice) : safeAmount(existing.totalPrice),
      amountPaid: dto.amountPaid,
      amountPaidMode: dto.amountPaidMode,
      amountPaidPercent: dto.amountPaidPercent,
      fallback: {
        amountPaid: existing.amountPaid,
        amountPaidMode: existing.amountPaidMode,
        amountPaidPercent: existing.amountPaidPercent,
      },
    });

    if (payment.totalPrice < 0 || payment.amountPaid < 0) {
      throw new BadRequestException('Price values must be greater than or equal to 0');
    }

    const baseUpdateData: Prisma.BookingUncheckedUpdateInput = {
      userId: nextUserId ?? null,
      guestName: nextGuestName,
      guestEmail: nextGuestEmail,
      guestPhone: nextGuestPhone,
      tourId: hasTour ? legacyTour.tourId : null,
      desiredDate: hasTour ? legacyTour.desiredDate : null,
      adults: hasTour ? legacyTour.adults : null,
      children: hasTour ? legacyTour.children : null,
      roomType: hasTour ? (dto.roomType ?? existing.roomType ?? RoomType.double) : null,
      hotelName: hasHotel ? legacyHotel.hotelName : null,
      hotelCheckIn: hasHotel ? legacyHotel.hotelCheckIn : null,
      hotelCheckOut: hasHotel ? legacyHotel.hotelCheckOut : null,
      hotelRoomType: hasHotel ? legacyHotel.hotelRoomType : null,
      hotelGuests: hasHotel ? legacyHotel.hotelGuests : null,
      hotelNotes: hasHotel ? legacyHotel.hotelNotes : null,
      totalPrice: payment.totalPrice,
      amountPaid: payment.amountPaid,
      currency: dto.currency ?? existing.currency,
      amountPaidMode: payment.amountPaidMode,
      amountPaidPercent: payment.amountPaidPercent,
      status: dto.status ?? existing.status,
      serviceStatus: dto.serviceStatus ?? existing.serviceStatus,
      adminNote:
        dto.adminNote !== undefined ? normalizeNullableString(dto.adminNote) : existing.adminNote,
      note: dto.note !== undefined ? normalizeNullableString(dto.note) : existing.note,
    };

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: baseUpdateData,
      });

      if (shouldReplaceTours) {
        await tx.bookingTour.deleteMany({ where: { bookingId: id } });

        if (normalizedTours.length > 0) {
          await tx.bookingTour.createMany({
            data: normalizedTours.map((tourItem) => ({
              bookingId: id,
              tourId: tourItem.tourId,
              desiredDate: tourItem.desiredDate,
              adults: tourItem.adults,
              children: tourItem.children,
              carType: tourItem.carType,
            })),
          });
        }
      }

      if (shouldReplaceHotel) {
        const existingHotelService = await tx.bookingHotelService.findUnique({
          where: { bookingId: id },
          select: { id: true },
        });

        if (normalizedHotel) {
          if (existingHotelService) {
            await tx.bookingHotelRoom.deleteMany({
              where: { hotelServiceId: existingHotelService.id },
            });

            await tx.bookingHotelService.update({
              where: { bookingId: id },
              data: {
                hotelId: normalizedHotel.hotelId,
                checkIn: normalizedHotel.checkIn,
                checkOut: normalizedHotel.checkOut,
                notes: normalizedHotel.notes,
                sendRequestToHotel: normalizedHotel.sendRequestToHotel,
              },
            });

            await tx.bookingHotelRoom.createMany({
              data: normalizedHotel.rooms.map((room) => ({
                hotelServiceId: existingHotelService.id,
                roomType: room.roomType,
                guestCount: room.guestCount,
              })),
            });
          } else {
            await tx.bookingHotelService.create({
              data: {
                bookingId: id,
                hotelId: normalizedHotel.hotelId,
                checkIn: normalizedHotel.checkIn,
                checkOut: normalizedHotel.checkOut,
                notes: normalizedHotel.notes,
                sendRequestToHotel: normalizedHotel.sendRequestToHotel,
                rooms: {
                  create: normalizedHotel.rooms.map((room) => ({
                    roomType: room.roomType,
                    guestCount: room.guestCount,
                  })),
                },
              },
            });
          }
        } else if (existingHotelService) {
          await tx.bookingHotelRoom.deleteMany({
            where: { hotelServiceId: existingHotelService.id },
          });
          await tx.bookingHotelService.delete({
            where: { bookingId: id },
          });
        }
      }
    });

    const updated = await this.findAdminBookingOrThrow(id);

    if (normalizedHotel?.sendRequestToHotel && resolvedHotel?.email) {
      await this.emailService.sendHotelInquiryEmail({
        recipientEmail: resolvedHotel.email,
        bookingId: updated.id,
        hotelName: resolvedHotel.name,
        guestName:
          updated.guestName ||
          (updated.user
            ? `${updated.user.firstName} ${updated.user.lastName}`.trim()
            : 'Guest customer'),
      });
    }

    return this.mapBooking(updated);
  }

  async deleteAdmin(id: string) {
    const existing = await this.findAdminBookingOrThrow(id);

    if (existing.isDeleted) {
      return {
        deleted: true,
        id,
      };
    }

    await this.prisma.booking.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return {
      deleted: true,
      id,
    };
  }

  async restoreAdmin(id: string) {
    const existing = await this.findAdminBookingOrThrow(id);

    if (!existing.isDeleted) {
      return {
        restored: true,
        id,
      };
    }

    await this.prisma.booking.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return {
      restored: true,
      id,
    };
  }

  async permanentDeleteAdmin(id: string) {
    await this.findAdminBookingOrThrow(id);

    await this.prisma.booking.delete({ where: { id } });

    return {
      permanentlyDeleted: true,
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
        tours: booking.tours.map((tourItem) => ({
          id: tourItem.id,
          tourId: tourItem.tourId,
          desiredDate: tourItem.desiredDate,
          adults: tourItem.adults,
          children: tourItem.children,
          carType: tourItem.carType,
          tour: tourItem.tour,
        })),
        tour:
          booking.tour && booking.desiredDate
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
        hotel: booking.hotelService
          ? {
              id: booking.hotelService.id,
              hotelId: booking.hotelService.hotelId,
              name: booking.hotelService.hotel.name,
              email: booking.hotelService.hotel.email,
              checkIn: booking.hotelService.checkIn,
              checkOut: booking.hotelService.checkOut,
              notes: booking.hotelService.notes,
              sendRequestToHotel: booking.hotelService.sendRequestToHotel,
              rooms: booking.hotelService.rooms,
            }
          : booking.hotelName
            ? {
                id: null,
                hotelId: null,
                name: booking.hotelName,
                email: null,
                checkIn: booking.hotelCheckIn,
                checkOut: booking.hotelCheckOut,
                notes: booking.hotelNotes,
                sendRequestToHotel: false,
                rooms: booking.hotelRoomType
                  ? [
                      {
                        id: 'legacy',
                        roomType: booking.hotelRoomType,
                        guestCount: booking.hotelGuests ?? 1,
                      },
                    ]
                  : [],
              }
            : null,
      },
      financials: {
        totalPrice: withTotals.totalPrice,
        amountPaid: withTotals.amountPaid,
        balanceDue: withTotals.balanceDue,
        currency: booking.currency,
        amountPaidMode: booking.amountPaidMode,
        amountPaidPercent: booking.amountPaidPercent,
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
      isDeleted: false,
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

    if (booking.isDeleted) {
      throw new BadRequestException('Cannot approve a deleted booking');
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

    const recipientEmail = booking.user?.email || booking.guestEmail || null;

    if (recipientEmail) {
      await this.emailService.sendBookingApprovedGuestConfirmation({
        recipientEmail,
        bookingId: booking.id,
        guestName: booking.guestName || booking.user?.email || 'Guest',
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

    if (booking.isDeleted) {
      throw new BadRequestException('Cannot reject a deleted booking');
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

    const recipientEmail = booking.user?.email || booking.guestEmail || null;

    if (recipientEmail) {
      await this.emailService.sendBookingDecisionEmail({
        recipientEmail,
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
      changeRequest.booking.isDeleted ||
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

    if (changeRequest.booking.isDeleted) {
      throw new BadRequestException('Cannot update a deleted booking');
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
          isDeleted: false,
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
          isDeleted: false,
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
