import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

jest.mock('../src/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {
    canActivate() {
      return false;
    }
  },
}));

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;

  const authServiceMock = {
    login: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/login', () => {
    authServiceMock.login.mockResolvedValueOnce({
      user: {
        id: '1',
        email: 'admin@uniceplac.com',
        role: 'ADMIN',
      },
    });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@uniceplac.com', password: 'admin12345' })
      .expect(201)
      .expect((response) => {
        expect(response.body.user.email).toBe('admin@uniceplac.com');
      });
  });

  it('GET /auth/me sem sessao deve retornar 403', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(403);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
});
