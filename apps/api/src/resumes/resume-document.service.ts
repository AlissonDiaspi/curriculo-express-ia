
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { ResumesService } from './resumes.service.js';

import { DocxGeneratorService } from '../documents/services/docx-generator.service.js';

import { PdfGeneratorService } from '../documents/services/pdf-generator.service.js';

import {
  resumeContentSchema,
} from './schemas/resume.schema.js';

const VALID_TEMPLATE_IDS = [
  'modelo-01',
  'modelo-02',
  'modelo-03',
] as const;

@Injectable()
export class ResumeDocumentService {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly docxGenerator: DocxGeneratorService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  /**
   * Gera o currículo em formato Word.
   *
   * Recupera os dados do PostgreSQL,
   * valida o conteúdo e preenche o modelo.
   */
  async generateDocx(
    sessionId: string,
    resumeId: string,
  ): Promise<Buffer> {
    const resume = await this.resumesService.findOne(
      sessionId,
      resumeId,
    );

    if (
      !resume.templateId ||
      !VALID_TEMPLATE_IDS.some(
        (id) => id === resume.templateId,
      )
    ) {
      throw new BadRequestException(
        'Selecione um modelo válido antes de gerar o currículo.',
      );
    }

    const result = resumeContentSchema.safeParse(
      resume.content,
    );

    if (!result.success) {
      throw new BadRequestException(
        'Os dados do currículo estão incompletos ou inválidos.',
      );
    }

    return this.docxGenerator.generateResume(
      resume.templateId,
      result.data,
    );
  }

  /**
   * Gera o currículo em PDF
   */
  async generatePdf(
    sessionId: string,
    resumeId: string,
  ): Promise<Buffer> {
    const docxBuffer = await this.generateDocx(
      sessionId,
      resumeId,
    );

    return this.pdfGenerator.convertDocxToPdf(
      docxBuffer,
    );
  }

  /**
   * Prévia do currículo.
   *
   */
  async generatePreview(
    sessionId: string,
    resumeId: string,
  ): Promise<Buffer> {
    return this.generatePdf(
      sessionId,
      resumeId,
    );
  }
}
