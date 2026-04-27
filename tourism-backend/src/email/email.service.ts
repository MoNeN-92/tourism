import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailLogStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type EmailDeliveryStatus = 'sent' | 'fallback_logged' | 'failed';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private getNumberConfig(key: string, fallback: number): number {
    const raw = this.configService.get<string>(key);
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private async sendTemplate(params: {
    recipientEmail: string;
    template: string;
    subject: string;
    text: string;
    payload?: unknown;
  }): Promise<EmailDeliveryStatus> {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPortRaw = this.configService.get<string>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');
    const smtpFrom = this.configService.get<string>('SMTP_FROM') || 'no-reply@vibegeorgia.com';
    const smtpConnectionTimeout = this.getNumberConfig('SMTP_CONNECTION_TIMEOUT_MS', 10000);
    const smtpGreetingTimeout = this.getNumberConfig('SMTP_GREETING_TIMEOUT_MS', 10000);
    const smtpSocketTimeout = this.getNumberConfig('SMTP_SOCKET_TIMEOUT_MS', 15000);

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

      return 'fallback_logged';
    }

    try {
      // Optional dependency by design: SMTP is used only when configured.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(smtpPortRaw),
        secure: Number(smtpPortRaw) === 465,
        connectionTimeout: smtpConnectionTimeout,
        greetingTimeout: smtpGreetingTimeout,
        socketTimeout: smtpSocketTimeout,
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

      return 'sent';
    } catch (error: any) {
      this.logger.error(`Email send failed for ${params.recipientEmail}`, error?.stack);

      await this.prisma.emailLog.create({
        data: {
          ...baseLog,
          status: EmailLogStatus.FAILED,
          error: error?.message || 'Unknown error',
        },
      });

      return 'failed';
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

  sendContactInquiryEmail(params: {
    recipientEmail: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) {
    const phonePart = params.phone ? `Phone: ${params.phone}\n` : '';

    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: 'contact-inquiry',
      subject: `New contact inquiry from ${params.name}`,
      text:
        `Name: ${params.name}\n` +
        `Email: ${params.email}\n` +
        phonePart +
        `\nMessage:\n${params.message}`,
      payload: params,
    });
  }

  sendContactAutoReplyEmail(params: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }) {
    return this.sendTemplate({
      recipientEmail: params.email,
      template: 'contact-auto-reply',
      subject: 'We received your message',
      text:
        `Hello ${params.name},\n\n` +
        'Thank you for contacting VibeGeorgia. We received your message and will get back to you shortly.\n\n' +
        'Your message:\n' +
        `${params.message}\n\n` +
        'Best regards,\nVibeGeorgia',
      payload: params,
    });
  }

  sendPasswordResetEmail(params: {
    recipientEmail: string;
    name: string;
    resetUrl: string;
    expiresInMinutes: number;
  }) {
    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: 'password-reset',
      subject: 'Reset your VibeGeorgia password',
      text:
        `Hello ${params.name},\n\n` +
        'We received a request to reset your VibeGeorgia password.\n\n' +
        `Reset link: ${params.resetUrl}\n\n` +
        `This link expires in ${params.expiresInMinutes} minutes.\n` +
        'If you did not request a password reset, you can safely ignore this email.\n\n' +
        'Best regards,\nVibeGeorgia',
      payload: params,
    });
  }

  sendPartnerAssignmentEmail(params: {
    recipientEmail: string;
    partnerName: string;
    partnerRole: 'driver' | 'guide';
    tourTitle: string;
    desiredDate: string;
  }) {
    const roleLabel = params.partnerRole === 'driver' ? 'driver' : 'guide';

    return this.sendTemplate({
      recipientEmail: params.recipientEmail,
      template: `partner-assignment-${params.partnerRole}`,
      subject: `New ${roleLabel} assignment for ${params.tourTitle}`,
      text:
        `Hello ${params.partnerName},\n\n` +
        `You have been assigned as ${roleLabel} for "${params.tourTitle}" on ${params.desiredDate}.\n\n` +
        'Please log in to the partner calendar to review the operational details.\n\n' +
        'Best regards,\nVibeGeorgia',
      payload: params,
    });
  }
}
