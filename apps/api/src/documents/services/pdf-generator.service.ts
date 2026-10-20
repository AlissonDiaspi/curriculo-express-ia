
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class PdfGeneratorService {
  async convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    const tempDir = await mkdtemp(
      join(tmpdir(), 'curriculo-express-'),
    );

    const inputPath = join(tempDir, 'curriculo.docx');
    const outputPath = join(tempDir, 'curriculo.pdf');

    try {
      await writeFile(inputPath, docxBuffer);

      const sofficePath =
        process.env.LIBREOFFICE_PATH ||
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

      await execFileAsync(
        sofficePath,
        [
          '--headless',
          '--convert-to',
          'pdf:writer_pdf_Export',
          '--outdir',
          tempDir,
          inputPath,
        ],
        {
          timeout: 30000,
          windowsHide: true,
        },
      );

      const pdfBuffer = await readFile(outputPath);

      if (
        pdfBuffer.length < 5 ||
        pdfBuffer.subarray(0, 5).toString() !== '%PDF-'
      ) {
        throw new Error('O arquivo gerado não é um PDF válido.');
      }

      return pdfBuffer;
    } catch (error) {
      console.error('Erro na conversão DOCX para PDF:', error);

      throw new InternalServerErrorException(
        'Não foi possível gerar o PDF do currículo.',
      );
    } finally {
      await rm(tempDir, {
        recursive: true,
        force: true,
      });
    }
  }
}
