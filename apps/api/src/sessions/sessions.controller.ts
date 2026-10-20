
import {
  Controller,
  Post,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { SessionsService } from './sessions.service.js';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
  ) {}

  @Post()
  async create(@Res({ passthrough: true }) response: Response) {
    const session = await this.sessionsService.create();

    response.cookie('ce_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: session.expiresAt,
    });

    return {
      expiresAt: session.expiresAt,
    };
  }
}
