import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import * as bcrypt from 'bcrypt';

describe('UserAuthService', () => {
  const createPrismaMock = () => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  });

  it('registers a new user and returns token payload', async () => {
    const prisma = createPrismaMock();
    const jwtService = { sign: jest.fn().mockReturnValue('token') };
    const service = new UserAuthService(prisma as any, jwtService as any);

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      firstName: 'Nika',
      lastName: 'Gelashvili',
      phone: '+995599000001',
      isActive: true,
      role: 'USER',
    });

    const result = await service.register({
      email: 'user@test.com',
      password: 'StrongPass123',
      firstName: 'Nika',
      lastName: 'Gelashvili',
      phone: '+995599000001',
    });

    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.access_token).toBe('token');
    expect(result.user.email).toBe('user@test.com');
  });

  it('throws conflict if email already exists', async () => {
    const prisma = createPrismaMock();
    const jwtService = { sign: jest.fn() };
    const service = new UserAuthService(prisma as any, jwtService as any);

    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.register({
        email: 'user@test.com',
        password: 'StrongPass123',
        firstName: 'Nika',
        lastName: 'Gelashvili',
        phone: '+995599000001',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws unauthorized when user is blocked', async () => {
    const prisma = createPrismaMock();
    const jwtService = { sign: jest.fn() };
    const service = new UserAuthService(prisma as any, jwtService as any);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      passwordHash: '$2b$10$yV6mQ8rThhEF3x3M1eG8sukwMmr18bODsPwhj/KgOMGNJUgIAQ9lK',
      isActive: false,
      firstName: 'Nika',
      lastName: 'Gelashvili',
      phone: '+995599000001',
      role: 'USER',
    });

    await expect(service.login('user@test.com', 'StrongPass123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns and signs actual user role on login', async () => {
    const prisma = createPrismaMock();
    const jwtService = { sign: jest.fn().mockReturnValue('token') };
    const service = new UserAuthService(prisma as any, jwtService as any);
    const passwordHash = await bcrypt.hash('StrongPass123', 10);

    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-user-1',
      email: 'admin@test.com',
      passwordHash,
      isActive: true,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+995599000001',
      role: 'ADMIN',
    });

    prisma.user.update.mockResolvedValue({
      id: 'admin-user-1',
    });

    const result = await service.login('admin@test.com', 'StrongPass123');

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'admin-user-1', role: 'ADMIN' }),
    );
    expect(result.user.role).toBe('ADMIN');
  });
});
