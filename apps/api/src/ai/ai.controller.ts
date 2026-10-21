
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

import type { AuthenticatedRequest } from '../sessions/guards/session/session.guard.js';

import { SessionGuard } from '../sessions/guards/session/session.guard.js';
import { GeminiService } from './services/gemini.service.js';
import { AiUsageService } from './services/ai-usage.service.js';
import { improveTextSchema } from './dto/improve-text.dto.js';

@Controller('ai')
@UseGuards(SessionGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly aiUsageService: AiUsageService,
  ) {}

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

  @Post('improve')
  async improve(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const result = improveTextSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Dados inválidos.',
        errors: result.error.flatten(),
      });
    }

    const { resumeId, text, type } = result.data;
    const sessionId = request.sessionId!;

    // Reserva a utilização antes de chamar o Gemini.
    // Se o limite acabou, retorna HTTP 409.
    const reservation = await this.aiUsageService.reserve(
      sessionId,
      resumeId,
      type,
    );

    try {
      const improvedText =
        await this.geminiService.improveText(text, type);

      if (!improvedText.trim()) {
        throw new Error('A IA retornou um texto vazio.');
      }

      // Só consome a utilização após gerar a sugestão.
      const consumed = await this.aiUsageService.consume(
        sessionId,
        resumeId,
        type,
        reservation,
      );

      if (!consumed) {
        throw new Error(
          'A reserva de utilização da IA expirou.',
        );
      }

      return {
        status: 'improved' as const,
        originalText: text,
        improvedText,
        type,
        remaining: 0,
      };
    } catch (error) {
      this.logger.warn(
        `Falha na melhoria com IA: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );

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

      return {
        status: 'unavailable' as const,
        originalText: text,
        improvedText: null,
        type,
        message:
          'A melhoria automática está temporariamente indisponível. ' +
          'Você pode continuar com seu texto ou tentar novamente.',
      };
    }
  }
}
