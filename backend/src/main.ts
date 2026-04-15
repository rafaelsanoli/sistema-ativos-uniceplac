import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
} from './auth/auth.constants';
import { AppModule } from './app.module';

type SwaggerRequest = {
  credentials?: string;
  headers?: Record<string, string>;
  method?: string;
};

function getCookieValue(cookieHeader: string, name: string) {
  const target = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!target) {
    return undefined;
  }

  return decodeURIComponent(target.slice(name.length + 1));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('UNICEPLAC - Sistema de Ativos API')
    .setDescription('Documentacao da API para avaliacao tecnica.')
    .setVersion('1.0.0')
    .addCookieAuth(AUTH_COOKIE_NAME, {
      type: 'apiKey',
      in: 'cookie',
      name: AUTH_COOKIE_NAME,
    })
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: CSRF_HEADER_NAME,
      },
      CSRF_HEADER_NAME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      requestInterceptor: (request: SwaggerRequest) => {
        request.credentials = 'include';

        const method = request.method?.toUpperCase() ?? 'GET';
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          return request;
        }

        const browserDocument = (
          globalThis as { document?: { cookie?: string } }
        ).document;
        const csrfToken = getCookieValue(
          browserDocument?.cookie ?? '',
          CSRF_COOKIE_NAME,
        );

        if (csrfToken) {
          request.headers = {
            ...(request.headers ?? {}),
            [CSRF_HEADER_NAME]: csrfToken,
          };
        }

        return request;
      },
    },
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}
void bootstrap();
