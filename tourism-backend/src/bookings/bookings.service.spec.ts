import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  const createPrismaMock = () => ({
    tour: {
      findUnique: jest.fn(),
    },
    booking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
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
  });

  it('prevents creating date-change request for cancelled booking', async () => {
    const prisma = createPrismaMock();
    const notifications = { createForUser: jest.fn() };
    const email = { sendBookingCreatedEmail: jest.fn() };
    const service = new BookingsService(prisma as any, notifications as any, email as any);

    prisma.booking.findUnique.mockResolvedValue({
      id: 'booking-1',
      userId: 'user-1',
      status: 'CANCELLED',
    });
    prisma.bookingChangeRequest.findFirst.mockResolvedValue(null);

    await expect(
      service.requestDateChange('user-1', 'booking-1', {
        requestedDate: '2026-03-12',
        reason: 'Need another date',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
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
