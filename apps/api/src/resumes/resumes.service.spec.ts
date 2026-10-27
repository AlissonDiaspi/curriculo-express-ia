
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { NotFoundException } from '@nestjs/common';

import { ResumesService } from './resumes.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type {
  CreateResumeInput,
  UpdateResumeInput,
} from './schemas/resume.schema.js';

describe('ResumesService', () => {
  let service: ResumesService;

  const prismaMock = {
    resume: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const sessionA = 'session-A';
  const sessionB = 'session-B';

  const resumeId = 'resume-123';

  const resume = {
    id: resumeId,
    sessionId: sessionA,
    title: 'Currículo de teste',
    templateId: 'modelo-01',
    content: {},
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new ResumesService(
      prismaMock as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('deve criar um currículo vinculado à sessão correta', async () => {
      prismaMock.resume.create.mockResolvedValue(
        resume,
      );

      const data = {
        title: 'Currículo de teste',
        templateId: 'modelo-01',
        content: {},
      } as CreateResumeInput;

      const result = await service.create(
        sessionA,
        data,
      );

      expect(result).toEqual(resume);

      expect(
        prismaMock.resume.create,
      ).toHaveBeenCalledWith({
        data: {
          title: data.title,
          templateId: data.templateId,
          content: data.content,
          sessionId: sessionA,
        },
      });
    });
  });

  describe('findOne', () => {
    it('deve permitir consultar um currículo da própria sessão', async () => {
      prismaMock.resume.findFirst.mockResolvedValue(
        resume,
      );

      const result = await service.findOne(
        sessionA,
        resumeId,
      );

      expect(result).toEqual(resume);

      expect(
        prismaMock.resume.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId: sessionA,
        },
      });
    });

    it('deve bloquear consulta de outra sessão', async () => {
      prismaMock.resume.findFirst.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(sessionB, resumeId),
      ).rejects.toThrow(NotFoundException);

      expect(
        prismaMock.resume.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId: sessionB,
        },
      });
    });

    it('deve retornar 404 para currículo inexistente', async () => {
      prismaMock.resume.findFirst.mockResolvedValue(
        null,
      );

      await expect(
        service.findOne(
          sessionA,
          'resume-inexistente',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um currículo da própria sessão', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      const updatedResume = {
        ...resume,
        title: 'Currículo atualizado',
      };

      prismaMock.resume.findFirst.mockResolvedValue(
        updatedResume,
      );

      const data: UpdateResumeInput = {
        title: 'Currículo atualizado',
      };

      const result = await service.update(
        sessionA,
        resumeId,
        data,
      );

      expect(result.title).toBe(
        'Currículo atualizado',
      );

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId: sessionA,
        },
        data: {
          title: 'Currículo atualizado',
        },
      });

      expect(
        prismaMock.resume.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId: sessionA,
        },
      });
    });

    it('deve bloquear atualização de outra sessão', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 0,
      });

      const data: UpdateResumeInput = {
        title: 'Alteração não autorizada',
      };

      await expect(
        service.update(
          sessionB,
          resumeId,
          data,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId: sessionB,
        },
        data: {
          title: 'Alteração não autorizada',
        },
      });

      expect(
        prismaMock.resume.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('deve retornar 404 ao atualizar currículo inexistente', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.update(
          sessionA,
          'resume-inexistente',
          {
            title: 'Novo título',
          },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar somente os campos informados', async () => {
      prismaMock.resume.updateMany.mockResolvedValue({
        count: 1,
      });

      prismaMock.resume.findFirst.mockResolvedValue({
        ...resume,
        title: 'Novo título',
      });

      await service.update(
        sessionA,
        resumeId,
        {
          title: 'Novo título',
        },
      );

      const call =
        prismaMock.resume.updateMany.mock.calls[0][0];

      expect(call.data).toEqual({
        title: 'Novo título',
      });

      expect(call.data).not.toHaveProperty(
        'templateId',
      );

      expect(call.data).not.toHaveProperty(
        'content',
      );
    });
  });
});
