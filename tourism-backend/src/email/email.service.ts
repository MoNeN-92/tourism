import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailLogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private async sendTemplate(params: {
    recipientEmail: string;
    template: string;
    subject: string;
    text: string;
    payload?: unknown;
  }) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPortRaw = this.configService.get<string>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || 'no-reply@vibegeorgia.com';

    const payload =
      params.payload === undefined
        ? undefined
        : (JSON.parse(JSON.stringify(params.payload)) as Prisma.InputJsonValue);

    const baseLog = {
      recipientEmail: params.recipientEmail,
      template: params.template,
      payload,
    };

    if (!smtpHost || !smtpPortRaw || !smtpUser || !smtpPass) {
      this.logger.log(
        `[EMAIL FALLBACK] ${params.subject} -> ${params.recipientEmail}: ${params.text}`,
      );

      await this.prisma.emailLog.create({
        data: {
          ...baseLog,
          status: EmailLogStatus.FALLBACK_LOGGED,
        },
      });

      return;
    }

    try {
      // Optional dependency by design: SMTP is used only when configured.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPortRaw),
        secure: Number(smtpPortRaw) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: params.recipientEmail,
        subject: params.subject,
        text: params.text,
      });

      await this.prisma.emailLog.create({
        data: {
          ...baseLog,
          status: EmailLogStatus.SENT,
        },
      });
    } catch (error: any) {
      this.logger.error(`Email send failed for ${params.recipientEmail}`, error?.stack);

      await this.prisma.emailLog.create({
        data: {
          ...baseLog,
          status: EmailLogStatus.FAILED,
          error: error?.message || 'Unknown error',
        },
      });
    }
  }

  sendBookingCreatedEmail(params: {
    recipientEmail: string;
    bookingId: string;
    tourTitle: string;
    desiredDate: string;
  }) {
    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: 'booking-created',
      subject: 'Your booking is received',
      text: `Booking ${params.bookingId} for ${params.tourTitle} (${params.desiredDate}) is pending admin approval.`,
      payload: params,
    });
  }

  sendBookingDecisionEmail(params: {
    recipientEmail: string;
    bookingId: string;
    decision: 'approved' | 'rejected' | 'cancelled';
    adminNote?: string | null;
  }) {
    const notePart = params.adminNote ? ` Admin note: ${params.adminNote}` : '';

    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: `booking-${params.decision}`,
      subject: `Your booking was ${params.decision}`,
      text: `Booking ${params.bookingId} has been ${params.decision}.${notePart}`,
      payload: params,
    });
  }

  sendBookingChangeDecisionEmail(params: {
    recipientEmail: string;
    bookingId: string;
    requestedDate: string;
    decision: 'approved' | 'rejected';
    adminNote?: string | null;
  }) {
    const notePart = params.adminNote ? ` Admin note: ${params.adminNote}` : '';

    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: `booking-change-${params.decision}`,
      subject: `Your booking date change was ${params.decision}`,
      text: `Date change request for booking ${params.bookingId} (${params.requestedDate}) was ${params.decision}.${notePart}`,
      payload: params,
    });
  }

  sendBookingApprovedGuestConfirmation(params: {
    recipientEmail: string;
    bookingId: string;
    guestName: string;
  }) {
    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: 'booking-approved-confirmation',
      subject: 'Your booking is confirmed',
      text: `Hello ${params.guestName}, your booking ${params.bookingId} has been approved. Thank you for choosing VibeGeorgia.`,
      payload: params,
    });
  }

  sendHotelInquiryEmail(params: {
    recipientEmail: string;
    bookingId: string;
    hotelName: string;
    guestName: string;
  }) {
    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: 'hotel-inquiry-request',
      subject: `Booking inquiry request for ${params.hotelName}`,
      text: `A booking inquiry (${params.bookingId}) was created for guest ${params.guestName}. Please confirm availability.`,
      payload: params,
    });
  }
}
