import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentAdmin } from './auth/decorators/current-admin.decorator';
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    throw new NotFoundException('Not Found');
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @Get('admin/profile')
  getAdminProfile(@CurrentAdmin() admin: any) {
    return {
      message: 'Admin profile',
      admin,
    };
  }
}
