
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { ResumesService } from './resumes.service.js';

import { DocxGeneratorService } from '../documents/services/docx-generator.service.js';

import { PdfGeneratorService } from '../documents/services/pdf-generator.service.js';

import { PdfWatermarkService } from '../documents/services/pdf-watermark.service.js';

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
    private readonly pdfWatermark: PdfWatermarkService,
  ) {}

  /**
   * Gera o currículo em formato DOCX.
   *
   * Recupera os dados reais do PostgreSQL,
   * valida o modelo selecionado e preenche
   * o template correspondente.
   *
   * IMPORTANTE:
   * Este método deve permanecer interno.
   * O download limpo só será permitido após
   * a confirmação do pagamento.
   */
  async generateDocx(
    sessionId: string,
    resumeId: string,
  ): Promise<Buffer> {
    // 1. Busca o currículo pertencente à sessão.
    const resume = await this.resumesService.findOne(
      sessionId,
      resumeId,
    );

    // 2. Verifica se o modelo selecionado é válido.
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

    // 3. Valida o conteúdo recuperado do banco.
    const result = resumeContentSchema.safeParse(
      resume.content,
    );

    if (!result.success) {
      throw new BadRequestException(
        'Os dados do currículo estão incompletos ou inválidos.',
      );
    }

    // 4. Gera o DOCX com o modelo selecionado.
    return this.docxGenerator.generateResume(
      resume.templateId,
      result.data,
    );
  }

  /**
   * Gera o currículo em formato PDF.
   *
   * Reutiliza o DOCX gerado e realiza
   * a conversão usando o LibreOffice.
   *
   * IMPORTANTE:
   * Este método também deve permanecer interno
   * até a confirmação do pagamento.
   */
  async generatePdf(
    sessionId: string,
    resumeId: string,
  ): Promise<Buffer> {
    // 1. Gera o DOCX com os dados reais.
    const docxBuffer = await this.generateDocx(
      sessionId,
      resumeId,
    );

    // 2. Converte o DOCX para PDF.
    return this.pdfGenerator.convertDocxToPdf(
      docxBuffer,
    );
  }

  /**
   * Gera uma prévia do currículo com marca d'água.
   *
   * Este método será utilizado na página /revisao
   * para permitir a visualização antes do pagamento.
   *
   * A marca d'água é aplicada diretamente ao PDF.
   */
  async generatePreview(
    sessionId: string,
    resumeId: string,
  ): Promise<Buffer> {
    // 1. Gera o PDF com os dados do currículo.
    const pdfBuffer = await this.generatePdf(
      sessionId,
      resumeId,
    );

    // 2. Aplica a marca d'água no PDF.
    return this.pdfWatermark.applyWatermark(
      pdfBuffer,
    );
  }
}
