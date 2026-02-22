import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminBookingsController, UserBookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [NotificationsModule, EmailModule],
  controllers: [UserBookingsController, AdminBookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
