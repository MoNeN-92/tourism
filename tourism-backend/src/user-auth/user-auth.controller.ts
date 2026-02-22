import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { UserAuthService } from './user-auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserJwtAuthGuard } from './guards/user-jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('users/auth')
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly configService: ConfigService,
  ) {}

  private getAuthCookieBaseOptions() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
  }

  private getAuthCookieOptions() {
    return {
      ...this.getAuthCookieBaseOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  @Post('register')
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authResult = await this.userAuthService.register(dto);
    response.cookie('user_token', authResult.access_token, this.getAuthCookieOptions());
    return authResult;
  }

  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authResult = await this.userAuthService.login(dto.email, dto.password);
    response.cookie('user_token', authResult.access_token, this.getAuthCookieOptions());
    return authResult;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('user_token', this.getAuthCookieBaseOptions());
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(UserJwtAuthGuard)
  me(@CurrentUser() user: any) {
    return this.userAuthService.me(user.id);
  }
}
