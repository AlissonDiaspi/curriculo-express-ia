
import {
  describe,
  expect,
  it,
  beforeEach,
  vi,
} from 'vitest';

import {
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';

import {
  SessionGuard,
  type AuthenticatedRequest,
} from './session.guard.js';

import { SessionsService } from '../../sessions.service.js';

describe('SessionGuard', () => {
  let guard: SessionGuard;

  const sessionsServiceMock = {
    validate: vi.fn(),
  };

  const createContext = (
    token?: string,
  ): {
    context: ExecutionContext;
    request: AuthenticatedRequest;
  } => {
    const request = {
      cookies: token
        ? { ce_session: token }
        : {},
    } as AuthenticatedRequest;

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    return {
      context,
      request,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    guard = new SessionGuard(
      sessionsServiceMock as unknown as SessionsService,
    );
  });

  it('deve permitir acesso com token válido', async () => {
    const token = 'a'.repeat(64);

    sessionsServiceMock.validate.mockResolvedValue({
      id: 'session-123',
    });

    const { context } = createContext(token);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);

    expect(
      sessionsServiceMock.validate,
    ).toHaveBeenCalledWith(token);
  });

  it('deve bloquear acesso sem cookie', async () => {
    const { context } = createContext();

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);

    expect(
      sessionsServiceMock.validate,
    ).not.toHaveBeenCalled();
  });

  it('deve bloquear token com formato inválido', async () => {
    const { context } = createContext(
      'token-invalido',
    );

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);

    expect(
      sessionsServiceMock.validate,
    ).not.toHaveBeenCalled();
  });

  it('deve bloquear sessão expirada ou inexistente', async () => {
    const token = 'b'.repeat(64);

    sessionsServiceMock.validate.mockResolvedValue(
      null,
    );

    const { context } = createContext(token);

    await expect(
      guard.canActivate(context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve disponibilizar o sessionId no request', async () => {
    const token = 'c'.repeat(64);

    sessionsServiceMock.validate.mockResolvedValue({
      id: 'session-456',
    });

    const { context, request } =
      createContext(token);

    await guard.canActivate(context);

    expect(request.sessionId).toBe(
      'session-456',
    );
  });
});
