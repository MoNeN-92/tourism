import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

function extractTokenFromCookieHeader(request: Request): string | null {
  const cookieHeader = request?.headers?.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader
    .split(';')
    .map((part) => part.trim());

  const tokenCookie =
    cookies.find((part) => part.startsWith('token=')) ||
    cookies.find((part) => part.startsWith('user_token='));

  if (!tokenCookie) {
    return null;
  }

  const tokenValue = tokenCookie.startsWith('token=')
    ? tokenCookie.slice('token='.length)
    : tokenCookie.slice('user_token='.length);

  return decodeURIComponent(tokenValue);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractTokenFromCookieHeader,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Admin or moderator token required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        isActive: true,
        role: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Admin or moderator token required');
    }

    const isAllowedRole =
      user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;

    if (!isAllowedRole || payload?.role !== user.role) {
      throw new UnauthorizedException('Admin or moderator token required');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
