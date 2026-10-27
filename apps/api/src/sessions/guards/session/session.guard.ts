
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

    /**
     * A autenticação utiliza somente
     * o cookie HttpOnly ce_session.
     */
    const token: unknown =
      request.cookies?.ce_session;

    if (
      typeof token !== 'string' ||
      !/^[a-f0-9]{64}$/.test(token)
    ) {
      throw new UnauthorizedException(
        'Sessão não informada ou token inválido.',
      );
    }

    const session =
      await this.sessionsService.validate(token);

    if (!session) {
      throw new UnauthorizedException(
        'Sessão inválida ou expirada.',
      );
    }

    /**
     * Disponibiliza o ID da sessão
     * para os controladores protegidos.
     */
    request.sessionId = session.id;

    return true;
  }
}
