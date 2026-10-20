
import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'node:crypto';

import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create() {
    // Gera um token aleatório de 256 bits
    const token = randomBytes(32).toString('hex');

    // Armazena apenas o hash do token
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    // Sessão válida por 24 horas
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const session = await this.prisma.anonymousSession.create({
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

  async validate(token: string) {
    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const session = await this.prisma.anonymousSession.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return session;
  }
}
