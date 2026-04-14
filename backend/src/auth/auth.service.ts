import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AUTH_COOKIE_NAME } from './auth.constants';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const token = await this.jwtService.signAsync(
      {
        sub: String(user._id),
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRES_IN',
          '8h',
        ) as never,
      },
    );

    const isProduction =
      this.configService.get<string>('NODE_ENV', 'development') ===
      'production';

    response.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return {
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
    };
  }

  me(user: { sub: string; email: string; role: string }) {
    return {
      user: {
        id: user.sub,
        email: user.email,
        role: user.role,
      },
    };
  }

  logout(response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME);

    return {
      message: 'Logout realizado com sucesso.',
    };
  }
}
