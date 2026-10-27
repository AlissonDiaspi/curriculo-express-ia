
import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service.js';
import { ResumesService } from '../../resumes/resumes.service.js';

import type { ImprovementType } from '../dto/improve-text.dto.js';

const RESERVATION_DURATION_MS = 2 * 60 * 1000;

@Injectable()
export class AiUsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resumesService: ResumesService,
  ) {}

  async getUsage(
    sessionId: string,
    resumeId: string,
  ) {
    const resume = await this.resumesService.findOne(
      sessionId,
      resumeId,
    );

    return {
      summary: {
        used: resume.aiSummaryUsed,
        available: !resume.aiSummaryUsed,
      },
      experience: {
        used: resume.aiExperienceUsed,
        available: !resume.aiExperienceUsed,
      },
    };
  }

  /**
   * Reserva atomicamente uma utilização.
   *
   * Impede que duas solicitações simultâneas
   * utilizem a mesma categoria.
   */
  async reserve(
    sessionId: string,
    resumeId: string,
    type: ImprovementType,
  ): Promise<Date> {
    const now = new Date();

    const reservedUntil = new Date(
      now.getTime() + RESERVATION_DURATION_MS,
    );

    const isSummary = type === 'summary';

    const result = await this.prisma.resume.updateMany({
      where: {
        id: resumeId,
        sessionId,

        ...(isSummary
          ? {
              aiSummaryUsed: false,
              OR: [
                { aiSummaryReservedUntil: null },
                {
                  aiSummaryReservedUntil: {
                    lt: now,
                  },
                },
              ],
            }
          : {
              aiExperienceUsed: false,
              OR: [
                { aiExperienceReservedUntil: null },
                {
                  aiExperienceReservedUntil: {
                    lt: now,
                  },
                },
              ],
            }),
      },

      data: isSummary
        ? {
            aiSummaryReservedUntil: reservedUntil,
          }
        : {
            aiExperienceReservedUntil: reservedUntil,
          },
    });

    if (result.count === 0) {
      await this.resumesService.findOne(
        sessionId,
        resumeId,
      );

      throw new ConflictException(
        'A melhoria com IA já foi utilizada ' +
          'ou está sendo processada para esta categoria.',
      );
    }

    return reservedUntil;
  }

  /**
   * Consome uma utilização reservada.
   *
   * Só é chamado quando o Gemini
   * realmente retorna uma melhoria.
   */
  async consume(
    sessionId: string,
    resumeId: string,
    type: ImprovementType,
    reservedUntil: Date,
  ): Promise<boolean> {
    const isSummary = type === 'summary';

    const result = await this.prisma.resume.updateMany({
      where: {
        id: resumeId,
        sessionId,

        ...(isSummary
          ? {
              aiSummaryUsed: false,
              aiSummaryReservedUntil: reservedUntil,
            }
          : {
              aiExperienceUsed: false,
              aiExperienceReservedUntil: reservedUntil,
            }),
      },

      data: isSummary
        ? {
            aiSummaryUsed: true,
            aiSummaryReservedUntil: null,
          }
        : {
            aiExperienceUsed: true,
            aiExperienceReservedUntil: null,
          },
    });

    return result.count === 1;
  }

  /**
   * Usado quando:
   * - O Gemini falha;
   * - O fallback local é utilizado;
   * - O processamento não é concluído.
   */
  async release(
    sessionId: string,
    resumeId: string,
    type: ImprovementType,
    reservedUntil: Date,
  ): Promise<void> {
    const isSummary = type === 'summary';

    await this.prisma.resume.updateMany({
      where: {
        id: resumeId,
        sessionId,

        ...(isSummary
          ? {
              aiSummaryUsed: false,
              aiSummaryReservedUntil: reservedUntil,
            }
          : {
              aiExperienceUsed: false,
              aiExperienceReservedUntil: reservedUntil,
            }),
      },

      data: isSummary
        ? {
            aiSummaryReservedUntil: null,
          }
        : {
            aiExperienceReservedUntil: null,
          },
    });
  }
}
