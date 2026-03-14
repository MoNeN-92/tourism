import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const createPrismaMock = () => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  });

  it('creates a user with normalized email and selected role', async () => {
    const prisma = createPrismaMock();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'staff@test.com',
      firstName: 'Staff',
      lastName: 'User',
      phone: '+995599000001',
      role: 'MODERATOR',
      partnerType: 'GUIDE',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    });

    const result = await service.create({
      email: ' Staff@Test.com ',
      password: 'StrongPass123',
      firstName: 'Staff',
      lastName: 'User',
      phone: '+995599000001',
      role: 'MODERATOR',
      partnerType: 'GUIDE',
      isActive: true,
    } as any);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'staff@test.com',
          role: 'MODERATOR',
          partnerType: 'GUIDE',
          isActive: true,
        }),
      }),
    );
    expect(result.email).toBe('staff@test.com');
    expect(result.role).toBe('MODERATOR');
  });

  it('updates partner type on an existing user', async () => {
    const prisma = createPrismaMock();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-2',
      email: 'driver@test.com',
      firstName: 'Driver',
      lastName: 'User',
      phone: '+995599000002',
      role: 'USER',
      partnerType: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-2',
      email: 'driver@test.com',
      firstName: 'Driver',
      lastName: 'User',
      phone: '+995599000002',
      role: 'USER',
      partnerType: 'DRIVER',
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-02T00:00:00.000Z'),
    });

    const result = await service.update('user-2', {
      partnerType: 'DRIVER',
    } as any);

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-2' },
        data: expect.objectContaining({
          partnerType: 'DRIVER',
        }),
      }),
    );
    expect((result as any).partnerType).toBe('DRIVER');
  });

  it('fails when email already exists', async () => {
    const prisma = createPrismaMock();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        email: 'user@test.com',
        password: 'StrongPass123',
        firstName: 'User',
        lastName: 'One',
        phone: '+995599000001',
        role: 'USER',
        isActive: true,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
