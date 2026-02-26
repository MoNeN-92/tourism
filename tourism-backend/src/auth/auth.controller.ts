import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
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
  async register(@Body() registerDto: RegisterDto) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const allowPublicRegister =
      this.configService.get<string>('ALLOW_PUBLIC_REGISTER') === 'true';

    if (isProduction && !allowPublicRegister) {
      throw new ForbiddenException('Registration is disabled');
    }

    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authResult = await this.authService.loginAdmin(
      loginDto.email,
      loginDto.password,
    );

    response.cookie('token', authResult.access_token, this.getAuthCookieOptions());

    return authResult;
  }

  @Post('admin/login')
  async loginAdmin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authResult = await this.authService.loginAdmin(
      loginDto.email,
      loginDto.password,
    );

    response.cookie('token', authResult.access_token, this.getAuthCookieOptions());

    return authResult;
  }

  @Post('staff/login')
  async loginStaff(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const authResult = await this.authService.loginStaff(
      loginDto.email,
      loginDto.password,
    );

    response.cookie('token', authResult.access_token, this.getAuthCookieOptions());

    return authResult;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', this.getAuthCookieBaseOptions());
    response.clearCookie('user_token', this.getAuthCookieBaseOptions());
    return { message: 'Logged out successfully' };
  }
}
