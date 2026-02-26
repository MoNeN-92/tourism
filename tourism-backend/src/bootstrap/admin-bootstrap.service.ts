import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminRole } from '@prisma/client';
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

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.prisma.admin.upsert({
        where: { email },
        update: {
          password: hashedPassword,
          firstName,
          lastName,
          role: AdminRole.ADMIN,
        },
        create: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: AdminRole.ADMIN,
        },
      });

      this.logger.log(`Admin account synced for ${email}`);
    } catch (error: any) {
      this.logger.error(`Admin bootstrap failed: ${error?.message || error}`);
    }
  }
}
