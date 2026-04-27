import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  private readonly passwordResetExpiryMinutes = 60;
  private readonly passwordResetCooldownMs = 60 * 1000;

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashResetToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private buildPasswordResetUrl(token: string, locale: 'ka' | 'en' | 'ru') {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'https://vibegeorgia.com';
    const normalizedBaseUrl = frontendUrl.replace(/\/+$/, '');

    return `${normalizedBaseUrl}/${locale}/account/reset-password?token=${encodeURIComponent(token)}`;
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterUserDto) {
    const normalizedEmail = this.normalizeEmail(dto.email);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(user);
  }

  async forgotPassword(email: string, locale: 'ka' | 'en' | 'ru' = 'en') {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        firstName: true,
        isActive: true,
        passwordResetSentAt: true,
      },
    });

    if (!user || !user.isActive) {
      return {
        message:
          'If an account exists for that email, a password reset link has been sent.',
      };
    }

    const now = Date.now();
    if (
      user.passwordResetSentAt &&
      now - user.passwordResetSentAt.getTime() < this.passwordResetCooldownMs
    ) {
      return {
        message:
          'If an account exists for that email, a password reset link has been sent.',
      };
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(plainToken);
    const expiresAt = new Date(now + this.passwordResetExpiryMinutes * 60 * 1000);
    const resetUrl = this.buildPasswordResetUrl(plainToken, locale);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
        passwordResetSentAt: new Date(now),
      },
    });

    const deliveryStatus = await this.emailService.sendPasswordResetEmail({
      recipientEmail: user.email,
      name: user.firstName,
      resetUrl,
      expiresInMinutes: this.passwordResetExpiryMinutes,
    });

    if (deliveryStatus === 'failed') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetTokenHash: null,
          passwordResetExpiresAt: null,
        },
      });

      throw new ServiceUnavailableException(
        'Unable to send reset email right now. Please try again later.',
      );
    }

    return {
      message:
        'If an account exists for that email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashResetToken(token.trim());

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Reset link is invalid or expired');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        passwordResetSentAt: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        partnerType: true,
        lastLoginAt: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }
}
