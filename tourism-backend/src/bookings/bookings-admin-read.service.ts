import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBookingsQueryDto } from './dto/admin-bookings-query.dto';
import { AdminRevenueQueryDto } from './dto/admin-revenue-query.dto';
import {
  addMonthUtc,
  AdminBookingRecord,
  BOOKING_ADMIN_INCLUDE,
  buildAdminBookingsWhere,
  INVOICE_LOGO_URL,
  monthToUtcStart,
  safeAmount,
  toDateOnly,
  toMonthKey,
  withBalance,
} from './bookings.shared';

@Injectable()
export class BookingsAdminReadService {
  constructor(private readonly prisma: PrismaService) {}

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

  private mapBooking(record: AdminBookingRecord) {
    return withBalance(record);
  }

  private mapBookings(records: AdminBookingRecord[]) {
    return records.map((record) => this.mapBooking(record));
  }

  async findAllAdmin(query: AdminBookingsQueryDto) {
    const records = await this.prisma.booking.findMany({
      where: buildAdminBookingsWhere(query, {
        isDeleted: false,
        dateField: 'desiredDate',
      }),
      include: BOOKING_ADMIN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return this.mapBookings(records);
  }

  async findTrashAdmin(query: AdminBookingsQueryDto) {
    const records = await this.prisma.booking.findMany({
      where: buildAdminBookingsWhere(query, {
        isDeleted: true,
        dateField: 'deletedAt',
      }),
      include: BOOKING_ADMIN_INCLUDE,
      orderBy: { deletedAt: 'desc' },
    });

    return this.mapBookings(records);
  }

  async findOneAdmin(id: string) {
    const booking = await this.findAdminBookingOrThrow(id);
    return this.mapBooking(booking);
  }

  async getInvoice(id: string) {
    const booking = await this.findAdminBookingOrThrow(id);
    const withTotals = this.mapBooking(booking);

    return {
      logoUrl: INVOICE_LOGO_URL,
      bookingId: booking.id,
      issuedAt: new Date().toISOString(),
      customer: {
        name: booking.user
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
          driverId: tourItem.driverId,
          guideId: tourItem.guideId,
          driver: tourItem.driver,
          guide: tourItem.guide,
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

    const dayMap = new Map<string, typeof approvedBookings>();

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
