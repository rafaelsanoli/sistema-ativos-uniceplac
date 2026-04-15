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
import {
  ApiBody,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @SkipCsrf()
  @ApiOperation({ summary: 'Autenticar usuario administrativo' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login realizado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais invalidas.' })
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(loginDto, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Obter sessao atual' })
  @ApiOkResponse({ description: 'Sessao valida.' })
  @ApiUnauthorizedResponse({ description: 'Sessao invalida ou expirada.' })
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
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Encerrar sessao atual' })
  @ApiOkResponse({ description: 'Logout realizado com sucesso.' })
  @ApiForbiddenResponse({ description: 'Token CSRF invalido.' })
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }
}
