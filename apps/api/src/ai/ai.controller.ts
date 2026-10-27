
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import type { AuthenticatedRequest } from '../sessions/guards/session/session.guard.js';

import { SessionGuard } from '../sessions/guards/session/session.guard.js';
import { GeminiService } from './services/gemini.service.js';
import { AiUsageService } from './services/ai-usage.service.js';
import { improveTextSchema } from './dto/improve-text.dto.js';

@Controller('ai')
@UseGuards(SessionGuard)
export class AiController {
  private readonly logger = new Logger(
    AiController.name,
  );

  constructor(
    private readonly geminiService: GeminiService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  /**
   * Consulta as utilizações de IA.
   *
   
   */
  @Get('usage/:resumeId')
  async getUsage(
    @Req() request: AuthenticatedRequest,
    @Param('resumeId') resumeId: string,
  ) {
    return this.aiUsageService.getUsage(
      request.sessionId!,
      resumeId,
    );
  }

  /**
   * Melhora o texto com Gemini
   * ou utiliza o fallback local.
   *
   
   */
  @Post('improve')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  async improve(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const validation =
      improveTextSchema.safeParse(body);

    if (!validation.success) {
      throw new BadRequestException({
        message: 'Dados inválidos.',
        errors: validation.error.flatten(),
      });
    }

    const { resumeId, text, type } =
      validation.data;

    const sessionId = request.sessionId!;

    /**
     * Reserva a utilização antes de
     * realizar a chamada ao Gemini.
     */
    const reservation =
      await this.aiUsageService.reserve(
        sessionId,
        resumeId,
        type,
      );

    let reservationConsumed = false;
    let reservationReleased = false;

    try {
      const improvement =
        await this.geminiService.improveTextWithMetadata(
          text,
          type,
        );

      const { improvedText, source } =
        improvement;

      if (!improvedText.trim()) {
        throw new Error(
          'O serviço retornou um texto vazio.',
        );
      }

      /**
       * Gemini:
       * consome uma utilização.
       */
      if (source === 'gemini') {
        const consumed =
          await this.aiUsageService.consume(
            sessionId,
            resumeId,
            type,
            reservation,
          );

        if (!consumed) {
          throw new Error(
            'A reserva expirou ou não pôde ser confirmada.',
          );
        }

        reservationConsumed = true;

        this.logger.log(
          `Melhoria Gemini confirmada: tipo=${type}`,
        );

        return {
          status: 'improved' as const,
          originalText: text,
          improvedText,
          type,
          source: 'gemini' as const,
          remaining: 0,
        };
      }

      /**
       * Fallback local:
       * não consome utilização.
       */
      if (source === 'local') {
        await this.aiUsageService.release(
          sessionId,
          resumeId,
          type,
          reservation,
        );

        reservationReleased = true;

        this.logger.log(
          `Fallback local utilizado: tipo=${type}`,
        );

        return {
          status: 'improved' as const,
          originalText: text,
          improvedText,
          type,
          source: 'local' as const,
          remaining: 1,
          message:
            'A IA está indisponível. ' +
            'Aplicamos correções básicas de formatação, ' +
            'sem consumir sua utilização de IA.',
        };
      }

      throw new Error(
        'Origem de melhoria desconhecida.',
      );
    } catch (error) {
      this.logger.warn(
        `Falha na melhoria de texto: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );

      if (
        !reservationConsumed &&
        !reservationReleased
      ) {
        try {
          await this.aiUsageService.release(
            sessionId,
            resumeId,
            type,
            reservation,
          );
        } catch (releaseError) {
          this.logger.error(
            'Falha ao liberar a reserva da IA.',
            releaseError instanceof Error
              ? releaseError.stack
              : String(releaseError),
          );
        }
      }

      return {
        status: 'unavailable' as const,
        originalText: text,
        improvedText: null,
        type,
        source: null,
        message:
          'Não foi possível processar a melhoria ' +
          'do texto no momento. ' +
          'Você pode continuar com seu texto ' +
          'ou tentar novamente.',
      };
    }
  }
}
