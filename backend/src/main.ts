import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AUTH_COOKIE_NAME, CSRF_HEADER_NAME } from './auth/auth.constants';
import { AppModule } from './app.module';

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
    },
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}
void bootstrap();
