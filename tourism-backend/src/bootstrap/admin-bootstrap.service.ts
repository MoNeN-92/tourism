import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    const emailRaw =
      this.configService.get<string>('SEED_ADMIN_EMAIL') ||
      this.configService.get<string>('ADMIN_EMAIL');
    const password =
      this.configService.get<string>('SEED_ADMIN_PASSWORD') ||
      this.configService.get<string>('ADMIN_PASSWORD');

    if (!emailRaw || !password) {
      this.logger.log(
        'Skipping admin bootstrap: admin seed environment variables are not set',
      );
      return;
    }

    const email = emailRaw.trim().toLowerCase();
    const firstName =
      this.configService.get<string>('SEED_ADMIN_FIRST_NAME') ||
      this.configService.get<string>('ADMIN_FIRST_NAME') ||
      'Admin';
    const lastName =
      this.configService.get<string>('SEED_ADMIN_LAST_NAME') ||
      this.configService.get<string>('ADMIN_LAST_NAME') ||
      'User';
    const phone =
      this.configService.get<string>('SEED_ADMIN_PHONE') ||
      this.configService.get<string>('ADMIN_PHONE') ||
      '+995000000000';

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.user.upsert({
        where: { email },
        update: {
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          role: UserRole.ADMIN,
          isActive: true,
        },
        create: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      this.logger.log(`Admin user synced for ${email}`);
    } catch (error: any) {
      this.logger.error(`Admin bootstrap failed: ${error?.message || error}`);
    }
  }
}
