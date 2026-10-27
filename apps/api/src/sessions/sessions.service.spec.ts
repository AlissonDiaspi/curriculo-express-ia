
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { createHash } from 'node:crypto';

import { SessionsService } from './sessions.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('SessionsService', () => {
  let service: SessionsService;

  const prismaMock = {
    anonymousSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new SessionsService(
      prismaMock as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('deve gerar um token hexadecimal de 64 caracteres', async () => {
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      prismaMock.anonymousSession.create.mockResolvedValue({
        id: 'session-1',
        expiresAt,
      });

      const result = await service.create();

      expect(result.token).toMatch(/^[a-f0-9]{64}$/);
      expect(result.expiresAt).toEqual(expiresAt);
    });

    it('deve armazenar somente o hash SHA-256 do token', async () => {
      prismaMock.anonymousSession.create.mockImplementation(
        async ({ data }) => ({
          id: 'session-1',
          expiresAt: data.expiresAt,
        }),
      );

      const result = await service.create();

      const expectedHash = createHash('sha256')
        .update(result.token)
        .digest('hex');

      expect(
        prismaMock.anonymousSession.create,
      ).toHaveBeenCalledWith({
        data: {
          tokenHash: expectedHash,
          expiresAt: expect.any(Date),
        },
      });

      expect(expectedHash).not.toBe(result.token);
    });

    it('deve gerar tokens diferentes para sessões diferentes', async () => {
      prismaMock.anonymousSession.create.mockImplementation(
        async ({ data }) => ({
          id: 'session-1',
          expiresAt: data.expiresAt,
        }),
      );

      const first = await service.create();
      const second = await service.create();

      expect(first.token).not.toBe(second.token);
    });
  });

  describe('validate', () => {
    it('deve retornar uma sessão válida', async () => {
      const token = 'a'.repeat(64);

      const session = {
        id: 'session-1',
        tokenHash: createHash('sha256')
          .update(token)
          .digest('hex'),
        expiresAt: new Date(
          Date.now() + 60_000,
        ),
      };

      prismaMock.anonymousSession.findUnique.mockResolvedValue(
        session,
      );

      const result = await service.validate(token);

      expect(result).toEqual(session);

      expect(
        prismaMock.anonymousSession.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          tokenHash: session.tokenHash,
        },
      });
    });

    it('deve rejeitar um token com formato inválido', async () => {
      const result = await service.validate(
        'token-invalido',
      );

      expect(result).toBeNull();

      expect(
        prismaMock.anonymousSession.findUnique,
      ).not.toHaveBeenCalled();
    });

    it('deve rejeitar um token inexistente', async () => {
      prismaMock.anonymousSession.findUnique.mockResolvedValue(
        null,
      );

      const result = await service.validate(
        'b'.repeat(64),
      );

      expect(result).toBeNull();
    });

    it('deve rejeitar uma sessão expirada', async () => {
      prismaMock.anonymousSession.findUnique.mockResolvedValue({
        id: 'session-1',
        expiresAt: new Date(
          Date.now() - 60_000,
        ),
      });

      const result = await service.validate(
        'c'.repeat(64),
      );

      expect(result).toBeNull();
    });
  });
});
