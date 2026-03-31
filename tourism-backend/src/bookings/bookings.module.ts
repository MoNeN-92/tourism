import { Module } from '@nestjs/common';
import { BookingsAdminMutationService } from './bookings-admin-mutation.service';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingsApprovalService } from './bookings-approval.service';
import { BookingsAdminReadService } from './bookings-admin-read.service';
import { AdminBookingsController, UserBookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [NotificationsModule, EmailModule],
  controllers: [UserBookingsController, AdminBookingsController],
  providers: [
    BookingsService,
    BookingsAdminReadService,
    BookingsAdminMutationService,
    BookingsApprovalService,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
