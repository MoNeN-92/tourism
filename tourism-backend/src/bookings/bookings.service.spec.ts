import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  const createPrismaMock = () => ({
    user: {
      findUnique: jest.fn(),
    },
    tour: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    bookingChangeRequest: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (ops: Promise<unknown>[] | ((tx: any) => Promise<unknown>)) => {
      if (typeof ops === 'function') {
        return ops({
          booking: {
            update: jest.fn(),
          },
          bookingChangeRequest: {
            update: jest.fn(),
          },
        });
      }
      return Promise.all(ops);
    }),
  });

  it('creates pending booking for active tour', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1', status: true });
    prisma.booking.create.mockResolvedValue({
      id: 'booking-1',
      status: 'PENDING',
      desiredDate: new Date('2026-03-10T00:00:00.000Z'),
      totalPrice: 0,
      amountPaid: 0,
      user: {
        id: 'user-1',
        email: 'user@test.com',
      },
      tour: {
        title_en: 'Kazbegi Tour',
      },
    });

    const result = await service.create('user-1', {
      tourId: 'tour-1',
      desiredDate: '2026-03-10',
      adults: 2,
      children: 1,
      roomType: 'double',
      note: 'Window side please',
    });

    expect(prisma.booking.create).toHaveBeenCalled();
    expect(result.status).toBe('PENDING');
    expect(result.balanceDue).toBe(0);
  });

  it('creates guest admin booking and computes balance due', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.booking.create.mockResolvedValue({
      id: 'booking-guest-1',
      userId: null,
      guestName: 'Guest Person',
      guestEmail: 'guest@test.com',
      guestPhone: '+995555000111',
      tourId: null,
      desiredDate: null,
      adults: null,
      children: null,
      roomType: null,
      hotelName: 'Radisson Blu',
      hotelCheckIn: new Date('2026-03-15T00:00:00.000Z'),
      hotelCheckOut: new Date('2026-03-18T00:00:00.000Z'),
      hotelRoomType: 'Deluxe',
      hotelGuests: 2,
      hotelNotes: null,
      totalPrice: 300,
      amountPaid: 150,
      note: null,
      adminNote: null,
      serviceStatus: 'PENDING',
      status: 'APPROVED',
      approvedAt: new Date('2026-03-01T00:00:00.000Z'),
      rejectedAt: null,
      cancelledAt: null,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      user: null,
      tour: null,
      changeRequests: [],
    });

    const result = await service.createAdmin({
      guestName: 'Guest Person',
      guestEmail: 'guest@test.com',
      guestPhone: '+995555000111',
      hotelName: 'Radisson Blu',
      hotelCheckIn: '2026-03-15',
      hotelCheckOut: '2026-03-18',
      totalPrice: 300,
      amountPaid: 150,
    });

    expect(result.balanceDue).toBe(150);
    expect(result.user).toBeNull();
    expect(result.guestName).toBe('Guest Person');
  });

  it('fails admin create when no tour or hotel service is provided', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    await expect(
      service.createAdmin({
        guestName: 'No Service Guest',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fails admin create when identity is missing', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1' });

    await expect(
      service.createAdmin({
        tourId: 'tour-1',
        desiredDate: '2026-03-10',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates admin booking financials and service status', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.booking.findUnique.mockResolvedValue({
      id: 'booking-1',
      userId: null,
      guestName: 'Guest Person',
      guestEmail: null,
      guestPhone: null,
      tourId: null,
      desiredDate: null,
      adults: null,
      children: null,
      roomType: null,
      hotelName: 'Iveria',
      hotelCheckIn: null,
      hotelCheckOut: null,
      hotelRoomType: null,
      hotelGuests: 2,
      hotelNotes: null,
      totalPrice: 200,
      amountPaid: 20,
      note: null,
      adminNote: null,
      serviceStatus: 'PENDING',
      status: 'APPROVED',
      approvedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      user: null,
      tour: null,
      changeRequests: [],
    });

    prisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      userId: null,
      guestName: 'Guest Person',
      guestEmail: null,
      guestPhone: null,
      tourId: null,
      desiredDate: null,
      adults: null,
      children: null,
      roomType: null,
      hotelName: 'Iveria',
      hotelCheckIn: null,
      hotelCheckOut: null,
      hotelRoomType: null,
      hotelGuests: 2,
      hotelNotes: null,
      totalPrice: 200,
      amountPaid: 120,
      note: null,
      adminNote: null,
      serviceStatus: 'COMPLETED',
      status: 'APPROVED',
      approvedAt: null,
      rejectedAt: null,
      cancelledAt: null,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      user: null,
      tour: null,
      changeRequests: [],
    });

    const result = await service.updateAdmin('booking-1', {
      serviceStatus: 'COMPLETED',
      amountPaid: 120,
    });

    expect(result.serviceStatus).toBe('COMPLETED');
    expect(result.balanceDue).toBe(80);
  });

  it('returns monthly revenue summary', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.booking.findMany.mockResolvedValue([
      {
        id: 'b1',
        createdAt: new Date('2026-03-05T00:00:00.000Z'),
        totalPrice: 300,
        amountPaid: 100,
      },
      {
        id: 'b2',
        createdAt: new Date('2026-03-15T00:00:00.000Z'),
        totalPrice: 200,
        amountPaid: 200,
      },
      {
        id: 'b3',
        createdAt: new Date('2026-04-02T00:00:00.000Z'),
        totalPrice: 400,
        amountPaid: 250,
      },
    ]);

    const result = await service.getRevenueSummary({
      fromMonth: '2026-03',
      toMonth: '2026-04',
    });

    expect(result.items).toHaveLength(2);
    expect(result.totals.totalRevenue).toBe(900);
    expect(result.totals.totalPaid).toBe(550);
    expect(result.totals.totalBalance).toBe(350);
  });

  it('throws not found when cancelling missing booking', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.booking.findUnique.mockResolvedValue(null);

    await expect(service.cancelByUser('user-1', 'booking-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
