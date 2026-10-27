
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  NotFoundException,
  type INestApplication,
} from '@nestjs/common';

import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { ResumeDocumentService } from '../src/resumes/resume-document.service.js';
import { configureHttp } from '../src/config/configure-http.js';

describe('Currículo Express IA - HTTP', () => {
  let app: INestApplication;

  const origin = 'http://localhost:3000';

  const sessionId = 'session-test-123';

  const sessionToken = 'a'.repeat(64);

  const validCookie = `ce_session=${sessionToken}`;

  const resumeId =
    '550e8400-e29b-41d4-a716-446655440000';

  const resume = {
    id: resumeId,
    sessionId,
    title: 'Meu currículo',
    templateId: 'modelo-01',
    content: {},
    status: 'DRAFT',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    anonymousSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },

    resume: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const documentMock = {
    generatePreview: vi.fn(),
    generatePdf: vi.fn(),
    generateDocx: vi.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(ResumeDocumentService)
      .useValue(documentMock)
      .compile();

    app = moduleRef.createNestApplication();

    configureHttp(app);

    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Sessão válida para os testes autenticados.
    prismaMock.anonymousSession.findUnique.mockResolvedValue({
      id: sessionId,
      expiresAt: new Date(Date.now() + 60_000),
    });

    // Operações simuladas de currículo.
    prismaMock.resume.create.mockResolvedValue(resume);

    prismaMock.resume.findFirst.mockResolvedValue(resume);

    prismaMock.resume.updateMany.mockResolvedValue({
      count: 1,
    });

    // Documentos simulados.
    documentMock.generatePreview.mockResolvedValue(
      Buffer.from('%PDF-1.4\n%Teste de prévia'),
    );

    documentMock.generatePdf.mockResolvedValue(
      Buffer.from('%PDF-1.4\n%Teste de download'),
    );

    documentMock.generateDocx.mockResolvedValue(
      Buffer.from('DOCX-DE-TESTE'),
    );
  });

  describe('Sessões e proteção de origem', () => {
    it('deve criar uma sessão e retornar cookie HttpOnly', async () => {
      prismaMock.anonymousSession.create.mockImplementation(
        async ({
          data,
        }: {
          data: {
            expiresAt: Date;
          };
        }) => ({
          id: sessionId,
          expiresAt: data.expiresAt,
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/sessions')
        .set('Origin', origin)
        .expect(201);

      const cookies = response.headers['set-cookie'];

      expect(cookies).toBeDefined();

      expect(String(cookies)).toContain('HttpOnly');

      expect(String(cookies)).toContain('ce_session=');
    });

    it('deve bloquear POST sem Origin ou Referer', async () => {
      const response = await request(app.getHttpServer())
        .post('/sessions')
        .expect(403);

      expect(response.body.message).toBe(
        'Origem não informada.',
      );
    });

    it('deve bloquear origem não autorizada', async () => {
      const response = await request(app.getHttpServer())
        .post('/sessions')
        .set('Origin', 'https://site-malicioso.com')
        .expect(403);

      expect(response.body.message).toBe(
        'Origem não permitida.',
      );
    });
  });

  describe('Segurança dos currículos', () => {
    it('deve bloquear acesso a currículo sem cookie', async () => {
      await request(app.getHttpServer())
        .get(`/resumes/${resumeId}`)
        .expect(401);

      expect(
        prismaMock.resume.findFirst,
      ).not.toHaveBeenCalled();
    });

    it('deve consultar currículo com sessão válida', async () => {
      const response = await request(app.getHttpServer())
        .get(`/resumes/${resumeId}`)
        .set('Cookie', validCookie)
        .expect(200);

      expect(response.body.id).toBe(resumeId);

      expect(
        prismaMock.resume.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
        },
      });
    });

    it('deve retornar 404 quando currículo não pertence à sessão', async () => {
      prismaMock.resume.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get(`/resumes/${resumeId}`)
        .set('Cookie', validCookie)
        .expect(404);

      expect(
        prismaMock.resume.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          sessionId,
        },
      });
    });

    it('deve bloquear atualização sem Origin', async () => {
      await request(app.getHttpServer())
        .patch(`/resumes/${resumeId}`)
        .set('Cookie', validCookie)
        .send({
          title: 'Alteração indevida',
        })
        .expect(403);

      expect(
        prismaMock.resume.updateMany,
      ).not.toHaveBeenCalled();
    });

    it('deve atualizar currículo autorizado', async () => {
      prismaMock.resume.findFirst.mockResolvedValue({
        ...resume,
        title: 'Novo título',
      });

      const response = await request(app.getHttpServer())
        .patch(`/resumes/${resumeId}`)
        .set('Origin', origin)
        .set('Cookie', validCookie)
        .send({
          title: 'Novo título',
        })
        .expect(200);

      expect(response.body.title).toBe('Novo título');

      expect(
        prismaMock.resume.updateMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: resumeId,
            sessionId,
          },
          data: {
            title: 'Novo título',
          },
        }),
      );
    });
  });

  describe('Segurança dos documentos', () => {
    it('deve bloquear download PDF sem sessão', async () => {
      await request(app.getHttpServer())
        .get(`/resumes/${resumeId}/download/pdf`)
        .expect(401);

      expect(
        documentMock.generatePdf,
      ).not.toHaveBeenCalled();
    });

    it('deve bloquear download DOCX sem sessão', async () => {
      await request(app.getHttpServer())
        .get(`/resumes/${resumeId}/download/docx`)
        .expect(401);

      expect(
        documentMock.generateDocx,
      ).not.toHaveBeenCalled();
    });

    it('deve baixar PDF com os cabeçalhos corretos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/resumes/${resumeId}/download/pdf`)
        .set('Cookie', validCookie)
        .expect(200);

      expect(response.headers['content-type']).toMatch(
        /application\/pdf/,
      );

      expect(
        response.headers['content-disposition'],
      ).toContain('attachment');

      expect(
        response.headers['content-disposition'],
      ).toContain('curriculo.pdf');

      expect(response.headers['cache-control']).toBe(
        'no-store, private',
      );

      expect(
        response.headers['x-content-type-options'],
      ).toBe('nosniff');

      expect(
        documentMock.generatePdf,
      ).toHaveBeenCalledWith(sessionId, resumeId);
    });

    it('deve baixar DOCX com os cabeçalhos corretos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/resumes/${resumeId}/download/docx`)
        .set('Cookie', validCookie)
        .expect(200);

      expect(response.headers['content-type']).toMatch(
        /wordprocessingml\.document/,
      );

      expect(
        response.headers['content-disposition'],
      ).toContain('attachment');

      expect(
        response.headers['content-disposition'],
      ).toContain('curriculo.docx');

      expect(response.headers['cache-control']).toBe(
        'no-store, private',
      );

      expect(
        response.headers['x-content-type-options'],
      ).toBe('nosniff');

      expect(
        documentMock.generateDocx,
      ).toHaveBeenCalledWith(sessionId, resumeId);
    });

    it('deve abrir a prévia PDF sem forçar download', async () => {
      const response = await request(app.getHttpServer())
        .get(`/resumes/${resumeId}/preview`)
        .set('Cookie', validCookie)
        .expect(200);

      expect(response.headers['content-type']).toMatch(
        /application\/pdf/,
      );

      expect(
        response.headers['content-disposition'],
      ).toContain('inline');

      expect(response.headers['cache-control']).toBe(
        'no-store, private',
      );

      expect(
        documentMock.generatePreview,
      ).toHaveBeenCalledWith(sessionId, resumeId);
    });

    it('deve retornar 404 quando o serviço de documentos negar acesso', async () => {
      documentMock.generatePdf.mockRejectedValue(
        new NotFoundException(
          'Currículo não encontrado',
        ),
      );

      await request(app.getHttpServer())
        .get(`/resumes/${resumeId}/download/pdf`)
        .set('Cookie', validCookie)
        .expect(404);

      expect(
        documentMock.generatePdf,
      ).toHaveBeenCalledWith(sessionId, resumeId);
    });
  });
});
