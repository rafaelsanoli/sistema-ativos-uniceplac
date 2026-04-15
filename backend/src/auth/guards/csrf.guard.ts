import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from '../auth.constants';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

type HeaderValue = string | string[] | undefined;

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requestPath = request.path ?? request.originalUrl ?? '';

    // Keep login endpoint always accessible for initial session creation.
    if (
      request.method.toUpperCase() === 'POST' &&
      requestPath.startsWith('/auth/login')
    ) {
      return true;
    }

    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method.toUpperCase())) {
      return true;
    }

    const hasAuthCookie = Boolean(request.cookies?.[AUTH_COOKIE_NAME]);
    if (!hasAuthCookie) {
      return true;
    }

    const cookieToken = request.cookies?.[CSRF_COOKIE_NAME] as
      | string
      | undefined;
    const headerToken = this.getHeaderToken(request.headers[CSRF_HEADER_NAME]);

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('Token CSRF invalido.');
    }

    return true;
  }

  private getHeaderToken(headerValue: HeaderValue) {
    if (!headerValue) {
      return undefined;
    }

    if (Array.isArray(headerValue)) {
      return headerValue[0];
    }

    return headerValue;
  }
}
