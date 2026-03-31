import { BadRequestException } from '@nestjs/common';
import { CarType, PaymentAmountMode, Prisma } from '@prisma/client';

export const BOOKING_ADMIN_INCLUDE = {
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
      driver: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      guide: {
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

export const INVOICE_LOGO_URL =
  'https://res.cloudinary.com/dj7qaif1i/image/upload/v1771052741/Logo_Geo_VIbe_idjg6d.png';

export type AdminBookingRecord = Prisma.BookingGetPayload<{
  include: typeof BOOKING_ADMIN_INCLUDE;
}>;

export type NormalizedTourService = {
  tourId: string;
  desiredDate: Date;
  adults: number;
  children: number;
  carType: CarType;
  driverId: string | null;
  guideId: string | null;
};

export type NormalizedHotelRoom = {
  roomType: string;
  guestCount: number;
};

export type NormalizedHotelService = {
  hotelId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  notes: string | null;
  sendRequestToHotel: boolean;
  rooms: NormalizedHotelRoom[];
};

export function dateOnlyToUtc(dateOnly: string): Date {
  const normalized = `${dateOnly}T00:00:00.000Z`;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException('Invalid date format');
  }

  return parsed;
}

export function parseBookingDateInput(value: string): Date {
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

export function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function toMonthKey(value: Date): string {
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function monthToUtcStart(value: string): Date {
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

export function addMonthUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

export function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function normalizeNullableString(value?: string | null): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function safeAmount(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function normalizePercent(value: number | null | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new BadRequestException('Percent value must be between 0 and 100');
  }

  return value;
}

export function withBalance<T extends { totalPrice: number; amountPaid: number }>(record: T) {
  return {
    ...record,
    balanceDue: safeAmount(record.totalPrice) - safeAmount(record.amountPaid),
  };
}

export function buildAdminBookingsWhere(
  query: {
    status?: unknown;
    serviceStatus?: unknown;
    tourId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  options: { isDeleted: boolean; dateField: 'desiredDate' | 'deletedAt' },
): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {
    isDeleted: options.isDeleted,
    ...(query.status ? { status: query.status as Prisma.EnumBookingStatusFilter | any } : {}),
    ...(query.serviceStatus
      ? { serviceStatus: query.serviceStatus as Prisma.EnumBookingServiceStatusFilter | any }
      : {}),
    ...(query.tourId ? { tourId: query.tourId } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
  };

  if (query.dateFrom || query.dateTo) {
    where[options.dateField] = {
      ...(query.dateFrom ? { gte: dateOnlyToUtc(query.dateFrom) } : {}),
      ...(query.dateTo ? { lte: dateOnlyToUtc(query.dateTo) } : {}),
    } as Prisma.DateTimeNullableFilter;
  }

  return where;
}
