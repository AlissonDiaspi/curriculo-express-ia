
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { AiController } from './ai.controller.js';
import { GeminiService } from './services/gemini.service.js';
import { AiUsageService } from './services/ai-usage.service.js';

import type { AuthenticatedRequest } from '../sessions/guards/session/session.guard.js';

describe('AiController', () => {
  let controller: AiController;

  const geminiMock = {
    improveTextWithMetadata: vi.fn(),
  };

  const usageMock = {
    getUsage: vi.fn(),
    reserve: vi.fn(),
    consume: vi.fn(),
    release: vi.fn(),
  };

  const sessionId = 'session-123';
  const resumeId = '550e8400-e29b-41d4-a716-446655440000';

  const reservation = new Date(
    '2026-10-27T12:00:00.000Z',
  );

  const request = {
    sessionId,
  } as AuthenticatedRequest;

  const validBody = {
    resumeId,
    text: 'Tenho experiência em atendimento ao cliente e organização de documentos.',
    type: 'summary',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new AiController(
      geminiMock as unknown as GeminiService,
      usageMock as unknown as AiUsageService,
    );

    usageMock.reserve.mockResolvedValue(reservation);
    usageMock.consume.mockResolvedValue(true);
    usageMock.release.mockResolvedValue(undefined);
  });

  it('deve consultar a utilização da sessão correta', async () => {
    const usage = {
      summary: {
        used: false,
        available: true,
      },
      experience: {
        used: false,
        available: true,
      },
    };

    usageMock.getUsage.mockResolvedValue(usage);

    const result = await controller.getUsage(
      request,
      resumeId,
    );

    expect(result).toEqual(usage);

    expect(usageMock.getUsage).toHaveBeenCalledWith(
      sessionId,
      resumeId,
    );
  });

  it('deve consumir utilização quando o Gemini retorna melhoria', async () => {
    geminiMock.improveTextWithMetadata.mockResolvedValue({
      improvedText:
        'Profissional com experiência em atendimento ao cliente e organização de documentos.',
      source: 'gemini',
    });

    const result = await controller.improve(
      request,
      validBody,
    );

    expect(result).toMatchObject({
      status: 'improved',
      source: 'gemini',
      remaining: 0,
      type: 'summary',
    });

    expect(usageMock.reserve).toHaveBeenCalledWith(
      sessionId,
      resumeId,
      'summary',
    );

    expect(
      geminiMock.improveTextWithMetadata,
    ).toHaveBeenCalledWith(
      validBody.text,
      'summary',
    );

    expect(usageMock.consume).toHaveBeenCalledWith(
      sessionId,
      resumeId,
      'summary',
      reservation,
    );

    expect(usageMock.release).not.toHaveBeenCalled();
  });

  it('deve liberar reserva quando utiliza fallback local', async () => {
    geminiMock.improveTextWithMetadata.mockResolvedValue({
      improvedText:
        'Tenho experiência em atendimento ao cliente e organização de documentos.',
      source: 'local',
    });

    const result = await controller.improve(
      request,
      validBody,
    );

    expect(result).toMatchObject({
      status: 'improved',
      source: 'local',
      remaining: 1,
    });

    expect(usageMock.release).toHaveBeenCalledWith(
      sessionId,
      resumeId,
      'summary',
      reservation,
    );

    expect(usageMock.consume).not.toHaveBeenCalled();
  });

  it('deve rejeitar dados inválidos antes de reservar', async () => {
    await expect(
      controller.improve(request, {
        resumeId: 'invalido',
        text: '',
        type: 'invalido',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(usageMock.reserve).not.toHaveBeenCalled();
    expect(
      geminiMock.improveTextWithMetadata,
    ).not.toHaveBeenCalled();
  });

  it('deve propagar conflito quando a utilização já foi reservada', async () => {
    usageMock.reserve.mockRejectedValue(
      new ConflictException(
        'Utilização indisponível.',
      ),
    );

    await expect(
      controller.improve(request, validBody),
    ).rejects.toThrow(ConflictException);

    expect(
      geminiMock.improveTextWithMetadata,
    ).not.toHaveBeenCalled();

    expect(usageMock.consume).not.toHaveBeenCalled();
  });

  it('deve liberar reserva quando o Gemini retorna texto vazio', async () => {
    geminiMock.improveTextWithMetadata.mockResolvedValue({
      improvedText: '   ',
      source: 'gemini',
    });

    const result = await controller.improve(
      request,
      validBody,
    );

    expect(result.status).toBe('unavailable');

    expect(usageMock.release).toHaveBeenCalledWith(
      sessionId,
      resumeId,
      'summary',
      reservation,
    );

    expect(usageMock.consume).not.toHaveBeenCalled();
  });

  it('deve tratar falha ao confirmar consumo', async () => {
    geminiMock.improveTextWithMetadata.mockResolvedValue({
      improvedText: 'Texto melhorado pelo Gemini.',
      source: 'gemini',
    });

    usageMock.consume.mockResolvedValue(false);

    const result = await controller.improve(
      request,
      validBody,
    );

    expect(result.status).toBe('unavailable');

    expect(usageMock.release).toHaveBeenCalledWith(
      sessionId,
      resumeId,
      'summary',
      reservation,
    );
  });

  it('deve tratar falha ao liberar reserva', async () => {
    geminiMock.improveTextWithMetadata.mockRejectedValue(
      new Error('Gemini indisponível'),
    );

    usageMock.release.mockRejectedValue(
      new Error('Falha no banco de dados'),
    );

    const result = await controller.improve(
      request,
      validBody,
    );

    expect(result.status).toBe('unavailable');

    expect(usageMock.release).toHaveBeenCalledTimes(1);
  });

  it('deve liberar reserva quando o serviço Gemini lança erro', async () => {
    geminiMock.improveTextWithMetadata.mockRejectedValue(
      new Error('Falha na API externa'),
    );

    const result = await controller.improve(
      request,
      validBody,
    );

    expect(result.status).toBe('unavailable');

    expect(usageMock.release).toHaveBeenCalledWith(
      sessionId,
      resumeId,
      'summary',
      reservation,
    );
  });
});
