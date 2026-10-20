
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const TEMPLATE_FILES = {
  'modelo-01': 'modelo-01.docx',
  'modelo-02': 'modelo-02.docx',
  'modelo-03': 'modelo-03.docx',
} as const;

export type TemplateId =
  keyof typeof TEMPLATE_FILES;

@Injectable()
export class TemplateLoaderService {
  private readonly templatesDirectory: string;

  constructor() {
    const cwd = process.cwd();

    this.templatesDirectory = cwd.endsWith('api')
      ? join(cwd, 'templates')
      : join(cwd, 'apps', 'api', 'templates');
  }

  async loadTemplate(
    templateId: string,
  ): Promise<Buffer> {
    if (!Object.prototype.hasOwnProperty.call(
      TEMPLATE_FILES,
      templateId,
    )) {
      throw new NotFoundException(
        'Modelo de currículo inválido.',
      );
    }

    const filename =
      TEMPLATE_FILES[templateId as TemplateId];

    const filePath = join(
      this.templatesDirectory,
      filename,
    );

    try {
      return await readFile(filePath);
    } catch (error) {
      console.error(
        `Erro ao carregar template ${templateId}:`,
        error,
      );

      throw new NotFoundException(
        'Arquivo do modelo não encontrado no servidor.',
      );
    }
  }
}
