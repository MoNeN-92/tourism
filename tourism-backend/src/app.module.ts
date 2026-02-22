// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ToursModule } from './tours/tours.module';
import { UploadsModule } from './uploads/uploads.module';
import { BlogModule } from './blog/blog.module';
import { UserAuthModule } from './user-auth/user-auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import { BookingsModule } from './bookings/bookings.module';
import { AdminBootstrapService } from './bootstrap/admin-bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ToursModule,
    UploadsModule,
    BlogModule,
    UserAuthModule,
    UsersModule,
    NotificationsModule,
    EmailModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AdminBootstrapService],
})
export class AppModule {}
