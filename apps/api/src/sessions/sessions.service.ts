
import { Injectable } from '@nestjs/common';

import {
  randomBytes,
  createHash,
} from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';

const SESSION_DURATION_MS =
  24 * 60 * 60 * 1000;

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Gera o hash SHA-256 do token.
   *
   * O token original nunca é
   * armazenado no banco.
   */
  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  /**
   * Cria uma sessão anônima válida
   * por 24 horas.
   */
  async create() {
    const token =
      randomBytes(32).toString('hex');

    const tokenHash =
      this.hashToken(token);

    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_MS,
    );

    const session =
      await this.prisma.anonymousSession.create({
        data: {
          tokenHash,
          expiresAt,
        },
      });

    return {
      token,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Valida o token de sessão.
   *
   * Retorna null quando o token
   * não existe ou está expirado.
   */
  async validate(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return null;
    }

    const tokenHash =
      this.hashToken(token);

    /**
     * tokenHash é único no Prisma.
     * findUnique utiliza esse identificador.
     */
    const session =
      await this.prisma.anonymousSession.findUnique({
        where: {
          tokenHash,
        },
      });

    if (!session) {
      return null;
    }

    if (
      session.expiresAt.getTime() <= Date.now()
    ) {
      return null;
    }

    return session;
  }
}
