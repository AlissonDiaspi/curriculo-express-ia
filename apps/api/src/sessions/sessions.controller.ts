
import {
  Controller,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import type {
  Request,
  Response,
} from 'express';

import { SessionsService } from './sessions.service.js';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
  ) {}

  @Post()
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  async create(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const existingToken: unknown =
      request.cookies?.ce_session;

    if (
      typeof existingToken === 'string' &&
      /^[a-f0-9]{64}$/.test(existingToken)
    ) {
      const existingSession =
        await this.sessionsService.validate(
          existingToken,
        );

      if (existingSession) {
        return {
          expiresAt: existingSession.expiresAt,
        };
      }
    }

    const session =
      await this.sessionsService.create();

    response.cookie(
      'ce_session',
      session.token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: session.expiresAt,
      },
    );

    return {
      expiresAt: session.expiresAt,
    };
  }
}
