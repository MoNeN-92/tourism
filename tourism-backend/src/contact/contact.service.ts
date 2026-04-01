import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 3;
const CONTACT_COOLDOWN_MS = 60 * 1000;

type ContactRateLimitEntry = {
  timestamps: number[];
  lastAcceptedAt: number | null;
};

@Injectable()
export class ContactService {
  private readonly submissionsByIp = new Map<string, ContactRateLimitEntry>();

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private getRateLimitEntry(ip: string, now: number): ContactRateLimitEntry {
    const existing = this.submissionsByIp.get(ip) ?? {
      timestamps: [],
      lastAcceptedAt: null,
    };

    existing.timestamps = existing.timestamps.filter(
      (timestamp) => now - timestamp < CONTACT_RATE_LIMIT_WINDOW_MS,
    );

    this.submissionsByIp.set(ip, existing);
    return existing;
  }

  private getContactRecipientEmail(): string {
    return (
      this.configService.get<string>('CONTACT_RECIPIENT_EMAIL') ||
      this.configService.get<string>('SMTP_FROM') ||
      'info@vibegeorgia.com'
    );
  }

  private normalizeInput(dto: CreateContactMessageDto) {
    return {
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim() || '',
      message: dto.message.trim(),
    };
  }

  private throwRateLimit(message: string): never {
    throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  private enforceRateLimit(ip: string) {
    const now = Date.now();
    const entry = this.getRateLimitEntry(ip, now);

    if (entry.lastAcceptedAt && now - entry.lastAcceptedAt < CONTACT_COOLDOWN_MS) {
      this.throwRateLimit('Please wait a moment before sending another message.');
    }

    if (entry.timestamps.length >= CONTACT_RATE_LIMIT_MAX_REQUESTS) {
      this.throwRateLimit('Too many contact requests. Please try again later.');
    }

    entry.timestamps.push(now);
    entry.lastAcceptedAt = now;
  }

  private rollbackAcceptedSubmission(ip: string) {
    const entry = this.submissionsByIp.get(ip);

    if (!entry || entry.timestamps.length === 0) {
      return;
    }

    entry.timestamps.pop();
    entry.lastAcceptedAt =
      entry.timestamps.length > 0 ? entry.timestamps[entry.timestamps.length - 1] : null;
  }

  async submit(dto: CreateContactMessageDto, ip: string) {
    if (dto.website) {
      return { accepted: true };
    }

    this.enforceRateLimit(ip);

    const contactMessage = this.normalizeInput(dto);
    const recipientEmail = this.getContactRecipientEmail();

    const results = await Promise.all([
      this.emailService.sendContactInquiryEmail({
        recipientEmail,
        ...contactMessage,
      }),
      this.emailService.sendContactAutoReplyEmail(contactMessage),
    ]);

    if (results.some((result) => result !== 'sent')) {
      this.rollbackAcceptedSubmission(ip);
      throw new HttpException(
        'Message could not be delivered right now. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { accepted: true };
  }
}
