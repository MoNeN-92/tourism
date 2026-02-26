import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    loginAdmin: jest.fn(),
    loginStaff: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('blocks public register in production by default', async () => {
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'production';
      if (key === 'ALLOW_PUBLIC_REGISTER') return 'false';
      return undefined;
    });

    await expect(
      controller.register({
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sets auth cookie on login', async () => {
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      return undefined;
    });

    authServiceMock.loginAdmin.mockResolvedValue({
      access_token: 'token-value',
      admin: { id: '1', email: 'admin@example.com', role: 'ADMIN' },
    });

    const response = {
      cookie: jest.fn(),
    };

    await controller.login(
      { email: 'admin@example.com', password: 'password123' },
      response as any,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'token',
      'token-value',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
  });

  it('clears auth cookie on logout', () => {
    configServiceMock.get.mockImplementation((key: string) => {
      if (key === 'NODE_ENV') return 'development';
      return undefined;
    });

    const response = {
      clearCookie: jest.fn(),
    };

    controller.logout(response as any);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
  });
});
