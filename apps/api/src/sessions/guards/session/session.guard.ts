
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import type { Request } from 'express';

import { SessionsService } from '../../sessions.service.js';

export interface AuthenticatedRequest extends Request {
  sessionId?: string;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessionsService: SessionsService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const cookieToken: unknown =
      request.cookies?.ce_session;

    const authorization = request.headers.authorization;

    let token: string | undefined;

    if (typeof cookieToken === 'string') {
      token = cookieToken;
    } else if (authorization) {
      const [type, value, extra] =
        authorization.split(' ');

      if (
        type === 'Bearer' &&
        value &&
        extra === undefined
      ) {
        token = value;
      }
    }

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      throw new UnauthorizedException(
        'Sessão não informada ou token inválido',
      );
    }

    const session =
      await this.sessionsService.validate(token);

    if (!session) {
      throw new UnauthorizedException(
        'Sessão inválida ou expirada',
      );
    }

    request.sessionId = session.id;

    return true;
  }
}
