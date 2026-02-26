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
      isActive: true,
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'staff@test.com',
          role: 'MODERATOR',
          isActive: true,
        }),
      }),
    );
    expect(result.email).toBe('staff@test.com');
    expect(result.role).toBe('MODERATOR');
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
