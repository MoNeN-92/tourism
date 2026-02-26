import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private buildAuthResponse(admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
  }) {
    const payload = { sub: admin.id, email: admin.email, role: admin.role };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  }

  private async validateCredentials(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return admin;
  }

  async register(registerDto: RegisterDto) {
    // შევამოწმოთ არსებობს თუ არა უკვე ეს email
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { email: registerDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    // დავაჰეშოთ პაროლი
    const hashedPassword = await this.hashPassword(registerDto.password);

    // შევქმნათ ახალი admin
    const admin = await this.prisma.admin.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: AdminRole.ADMIN,
      },
    });

    return this.buildAuthResponse(admin);
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.validateCredentials(email, password);

    if (admin.role !== AdminRole.ADMIN) {
      throw new UnauthorizedException('Admin credentials are required');
    }

    return this.buildAuthResponse(admin);
  }

  async loginStaff(email: string, password: string) {
    const admin = await this.validateCredentials(email, password);

    if (admin.role !== AdminRole.MODERATOR) {
      throw new UnauthorizedException('Staff credentials are required');
    }

    return this.buildAuthResponse(admin);
  }

  async login(email: string, password: string) {
    return this.loginAdmin(email, password);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
