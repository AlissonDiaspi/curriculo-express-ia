
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  Controller,
  Get,
  type INestApplication,
} from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import {
  Throttle,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import { Test } from '@nestjs/testing';
import request from 'supertest';

@Controller('throttle-test')
class ThrottleTestController {
  @Get('sessions')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  sessions() {
    return { ok: true };
  }

  @Get('resumes')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  resumes() {
    return { ok: true };
  }

  @Get('ai')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  ai() {
    return { ok: true };
  }
}

describe('Rate limiting HTTP', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60_000,
            limit: 60,
          },
        ]),
      ],
      controllers: [ThrottleTestController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('deve bloquear após 10 requisições de sessões', async () => {
    const endpoint = '/throttle-test/sessions';

    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .get(endpoint)
        .expect(200);
    }

    const response = await request(
      app.getHttpServer(),
    )
      .get(endpoint)
      .expect(429);

    expect(response.body.statusCode).toBe(429);
  });

  it('deve bloquear após 10 requisições de currículos', async () => {
    const endpoint = '/throttle-test/resumes';

    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .get(endpoint)
        .expect(200);
    }

    const response = await request(
      app.getHttpServer(),
    )
      .get(endpoint)
      .expect(429);

    expect(response.body.statusCode).toBe(429);
  });

  it('deve bloquear após 5 requisições de IA', async () => {
    const endpoint = '/throttle-test/ai';

    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .get(endpoint)
        .expect(200);
    }

    const response = await request(
      app.getHttpServer(),
    )
      .get(endpoint)
      .expect(429);

    expect(response.body.statusCode).toBe(429);
  });
});
