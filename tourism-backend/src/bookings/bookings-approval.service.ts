import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BookingChangeRequestStatus,
  BookingStatus,
  NotificationType,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminBookingDecisionDto } from './dto/admin-booking-decision.dto';
import { toDateOnly, withBalance } from './bookings.shared';

@Injectable()
export class BookingsApprovalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

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
}
