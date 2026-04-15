import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CSRF_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

type UserRequest = Request & {
  user?: {
    sub: string;
    email: string;
    role: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @SkipCsrf()
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: UserRequest) {
    if (!request.user) {
      throw new UnauthorizedException('Sessao invalida ou expirada.');
    }

    return this.authService.me(
      request.user,
      request.cookies?.[CSRF_COOKIE_NAME] as string | undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }
}
