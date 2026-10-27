
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { ResumeDocumentService } from './resume-document.service.js';
import { ResumesService } from './resumes.service.js';

import { DocxGeneratorService } from '../documents/services/docx-generator.service.js';
import { PdfGeneratorService } from '../documents/services/pdf-generator.service.js';

describe('ResumeDocumentService', () => {
  let service: ResumeDocumentService;

  const sessionId = 'session-123';

  const resumeId =
    '550e8400-e29b-41d4-a716-446655440000';

  const docxBuffer = Buffer.from(
    'DOCX-DE-TESTE',
  );

  const pdfBuffer = Buffer.from(
    '%PDF-1.4\nPDF-DE-TESTE',
  );

  const resumesMock = {
    findOne: vi.fn(),
  };

  const docxMock = {
    generateResume: vi.fn(),
  };

  const pdfMock = {
    convertDocxToPdf: vi.fn(),
  };

  // Conteúdo mínimo usado como base.
  // Caso o schema exija outros campos,
  // vamos ajustar após executar o teste.
  const validContent = {
    personal: {
      fullName: 'Pessoa de Teste',
      email: 'teste@exemplo.com',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
    },
    summary: 'Profissional com experiência em tecnologia.',
    experiences: [],
    education: [],
    skills: [],
  };

  const createResume = (
    templateId: string | null = 'modelo-01',
    content: unknown = validContent,
  ) => ({
    id: resumeId,
    sessionId,
    title: 'Currículo de teste',
    templateId,
    content,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    service = new ResumeDocumentService(
      resumesMock as unknown as ResumesService,
      docxMock as unknown as DocxGeneratorService,
      pdfMock as unknown as PdfGeneratorService,
    );

    resumesMock.findOne.mockResolvedValue(
      createResume(),
    );

    docxMock.generateResume.mockResolvedValue(
      docxBuffer,
    );

    pdfMock.convertDocxToPdf.mockResolvedValue(
      pdfBuffer,
    );
  });

  describe('generateDocx', () => {
    it('deve gerar DOCX para currículo válido', async () => {
      const result = await service.generateDocx(
        sessionId,
        resumeId,
      );

      expect(result).toEqual(docxBuffer);

      expect(
        resumesMock.findOne,
      ).toHaveBeenCalledWith(
        sessionId,
        resumeId,
      );

      expect(
        docxMock.generateResume,
      ).toHaveBeenCalledWith(
        'modelo-01',
        expect.objectContaining({
          summary: validContent.summary,
        }),
      );
    });

    it.each([
      'modelo-01',
      'modelo-02',
      'modelo-03',
    ])(
      'deve aceitar o template %s',
      async (templateId) => {
        resumesMock.findOne.mockResolvedValue(
          createResume(templateId),
        );

        await service.generateDocx(
          sessionId,
          resumeId,
        );

        expect(
          docxMock.generateResume,
        ).toHaveBeenCalledWith(
          templateId,
          expect.any(Object),
        );
      },
    );

    it('deve rejeitar um template inexistente', async () => {
      resumesMock.findOne.mockResolvedValue(
        createResume('modelo-99'),
      );

      await expect(
        service.generateDocx(
          sessionId,
          resumeId,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(
        docxMock.generateResume,
      ).not.toHaveBeenCalled();
    });

    it('deve rejeitar currículo sem template', async () => {
      resumesMock.findOne.mockResolvedValue(
        createResume(null),
      );

      await expect(
        service.generateDocx(
          sessionId,
          resumeId,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(
        docxMock.generateResume,
      ).not.toHaveBeenCalled();
    });

    it('deve rejeitar conteúdo inválido', async () => {
      resumesMock.findOne.mockResolvedValue(
        createResume(
          'modelo-01',
          null,
        ),
      );

      await expect(
        service.generateDocx(
          sessionId,
          resumeId,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(
        docxMock.generateResume,
      ).not.toHaveBeenCalled();
    });

    it('deve bloquear currículo de outra sessão', async () => {
      resumesMock.findOne.mockRejectedValue(
        new NotFoundException(
          'Currículo não encontrado',
        ),
      );

      await expect(
        service.generateDocx(
          'outra-sessao',
          resumeId,
        ),
      ).rejects.toThrow(NotFoundException);

      expect(
        resumesMock.findOne,
      ).toHaveBeenCalledWith(
        'outra-sessao',
        resumeId,
      );

      expect(
        docxMock.generateResume,
      ).not.toHaveBeenCalled();
    });
  });

  describe('generatePdf', () => {
    it('deve converter o DOCX gerado para PDF', async () => {
      const result = await service.generatePdf(
        sessionId,
        resumeId,
      );

      expect(result).toEqual(pdfBuffer);

      expect(
        docxMock.generateResume,
      ).toHaveBeenCalledTimes(1);

      expect(
        pdfMock.convertDocxToPdf,
      ).toHaveBeenCalledWith(
        docxBuffer,
      );
    });
  });

  describe('generatePreview', () => {
    it('deve gerar a prévia utilizando o PDF original', async () => {
      const result = await service.generatePreview(
        sessionId,
        resumeId,
      );

      expect(result).toEqual(pdfBuffer);

      expect(
        pdfMock.convertDocxToPdf,
      ).toHaveBeenCalledWith(
        docxBuffer,
      );
    });
  });
});
