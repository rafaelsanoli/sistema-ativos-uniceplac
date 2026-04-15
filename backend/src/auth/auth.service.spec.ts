import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuthService(usersService, jwtService, configService);
  });

  it('deve realizar login e setar cookie de sessao', async () => {
    const cookieMock = jest.fn();
    const clearCookieMock = jest.fn();
    const response = {
      cookie: cookieMock,
      clearCookie: clearCookieMock,
    } as unknown as Response;

    usersService.findByEmail.mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'admin@uniceplac.com',
      passwordHash: 'hash',
      role: 'ADMIN',
    } as never);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token' as never);
    configService.get.mockImplementation((key: string) => {
      if (key === 'JWT_EXPIRES_IN') return '8h';
      if (key === 'NODE_ENV') return 'development';
      return undefined;
    });

    const result = await service.login(
      {
        email: 'admin@uniceplac.com',
        password: 'admin12345',
      },
      response,
    );

    expect(result.user.email).toBe('admin@uniceplac.com');
    expect(cookieMock).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      }),
    );
  });

  it('deve rejeitar login com usuario inexistente', async () => {
    usersService.findByEmail.mockResolvedValue(null as never);

    await expect(
      service.login(
        {
          email: 'invalido@uniceplac.com',
          password: 'senha',
        },
        {
          cookie: jest.fn(),
          clearCookie: jest.fn(),
        } as unknown as Response,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('deve limpar cookie no logout', () => {
    const cookieMock = jest.fn();
    const clearCookieMock = jest.fn();
    const response = {
      cookie: cookieMock,
      clearCookie: clearCookieMock,
    } as unknown as Response;

    const result = service.logout(response);

    expect(result.message).toContain('Logout');
    expect(clearCookieMock).toHaveBeenCalledWith(AUTH_COOKIE_NAME);
  });
});
