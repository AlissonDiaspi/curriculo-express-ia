
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ConflictException } from '@nestjs/common';

import { AiUsageService } from './ai-usage.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ResumesService } from '../../resumes/resumes.service.js';

describe('AiUsageService', () => {
  let service: AiUsageService;

  const prismaMock = {
    resume: {
      updateMany: vi.fn(),
    },
  };

  const resumesServiceMock = {
    findOne: vi.fn(),
  };

  const sessionId = 'session-123';
  const resumeId = 'resume-123';

  beforeEach(() => {
    vi.clearAllMocks();

    service = new AiUsageService(
      prismaMock as unknown as PrismaService,
      resumesServiceMock as unknown as ResumesService,
    );
  });

  describe('getUsage', () => {
    it('deve informar quando ambas as melhorias estão disponíveis', async () => {
      resumesServiceMock.findOne.mockResolvedValue({
        aiSummaryUsed: false,
        aiExperienceUsed: false,
      });

      const result = await service.getUsage(
        sessionId,
        resumeId,
      );

      expect(result).toEqual({
        summary: {
          used: false,
          available: true,
        },
        experience: {
          used: false,
          available: true,
        },
      });

      expect(
        resumesServiceMock.findOne,
      ).toHaveBeenCalledWith(
        sessionId,
        resumeId,
      );
    });

    it('deve identificar uma melhoria já consumida', async () => {
      resumesServiceMock.findOne.mockResolvedValue({
        aiSummaryUsed: true,
        aiExperienceUsed: false,
      });

      const result = await service.getUsage(
        sessionId,
        resumeId,
      );

      expect(result.summary).toEqual({
        used: true,
        available: false,
      });

      expect(result.experience.available).toBe(true);
    });
  });

  describe('reserve', () => {
    it('deve reservar uma melhoria do resumo', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      const reservation = await service.reserve(
        sessionId,
        resumeId,
        'summary',
      );

      expect(reservation).toBeInstanceOf(Date);

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
          aiSummaryUsed: false,
          OR: [
            {
              aiSummaryReservedUntil: null,
            },
            {
              aiSummaryReservedUntil: {
                lt: expect.any(Date),
              },
            },
          ],
        },
        data: {
          aiSummaryReservedUntil: reservation,
        },
      });
    });

    it('deve reservar uma melhoria de experiência', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      const reservation = await service.reserve(
        sessionId,
        resumeId,
        'experience',
      );

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
          aiExperienceUsed: false,
          OR: [
            {
              aiExperienceReservedUntil: null,
            },
            {
              aiExperienceReservedUntil: {
                lt: expect.any(Date),
              },
            },
          ],
        },
        data: {
          aiExperienceReservedUntil: reservation,
        },
      });
    });

    it('deve rejeitar uma categoria já utilizada ou reservada', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 0,
      });

      resumesServiceMock.findOne.mockResolvedValue({
        id: resumeId,
      });

      await expect(
        service.reserve(
          sessionId,
          resumeId,
          'summary',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('deve impedir reserva para currículo de outra sessão', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 0,
      });

      resumesServiceMock.findOne.mockRejectedValue(
        new Error('Currículo não encontrado'),
      );

      await expect(
        service.reserve(
          'outra-sessao',
          resumeId,
          'summary',
        ),
      ).rejects.toThrow('Currículo não encontrado');

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sessionId: 'outra-sessao',
          }),
        }),
      );
    });
  });

  describe('consume', () => {
    it('deve consumir uma reserva válida', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      const reservation = new Date(
        '2026-10-27T12:00:00.000Z',
      );

      const result = await service.consume(
        sessionId,
        resumeId,
        'summary',
        reservation,
      );

      expect(result).toBe(true);

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
          aiSummaryUsed: false,
          aiSummaryReservedUntil: reservation,
        },
        data: {
          aiSummaryUsed: true,
          aiSummaryReservedUntil: null,
        },
      });
    });

    it('deve retornar false quando a reserva não puder ser consumida', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 0,
      });

      const result = await service.consume(
        sessionId,
        resumeId,
        'summary',
        new Date(),
      );

      expect(result).toBe(false);
    });

    it('deve consumir somente a categoria solicitada', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      const reservation = new Date();

      await service.consume(
        sessionId,
        resumeId,
        'experience',
        reservation,
      );

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
          aiExperienceUsed: false,
          aiExperienceReservedUntil: reservation,
        },
        data: {
          aiExperienceUsed: true,
          aiExperienceReservedUntil: null,
        },
      });
    });
  });

  describe('release', () => {
    it('deve liberar uma reserva sem consumir utilização', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      const reservation = new Date();

      await service.release(
        sessionId,
        resumeId,
        'summary',
        reservation,
      );

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
          aiSummaryUsed: false,
          aiSummaryReservedUntil: reservation,
        },
        data: {
          aiSummaryReservedUntil: null,
        },
      });
    });

    it('não deve liberar uma reserva de outra sessão', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 0,
      });

      const reservation = new Date();

      await service.release(
        'outra-sessao',
        resumeId,
        'summary',
        reservation,
      );

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sessionId: 'outra-sessao',
            aiSummaryReservedUntil: reservation,
          }),
        }),
      );
    });
  });
});
