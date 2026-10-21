
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';

import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(
    PdfGeneratorService.name,
  );

  async convertDocxToPdf(
    docxBuffer: Buffer,
  ): Promise<Buffer> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await this.convertOnce(docxBuffer);
      } catch (error) {
        lastError = error;

        this.logger.warn(
          `Conversão PDF falhou na tentativa ${attempt}/2: ${
            error instanceof Error
              ? error.message
              : String(error)
          }`,
        );

        if (attempt < 2) {
          await new Promise<void>((resolve) =>
            setTimeout(resolve, 500),
          );
        }
      }
    }

    this.logger.error(
      'Todas as tentativas de conversão falharam.',
      lastError instanceof Error
        ? lastError.stack
        : String(lastError),
    );

    throw new InternalServerErrorException(
      'Não foi possível gerar o PDF do currículo.',
    );
  }

  private async convertOnce(
    docxBuffer: Buffer,
  ): Promise<Buffer> {
    const tempDir = await mkdtemp(
      join(tmpdir(), 'curriculo-express-'),
    );

    const inputPath = join(
      tempDir,
      'curriculo.docx',
    );

    const outputPath = join(
      tempDir,
      'curriculo.pdf',
    );

    const profilePath = join(
      tempDir,
      'libreoffice-profile',
    );

    try {
      await writeFile(
        inputPath,
        docxBuffer,
      );

      const sofficePath =
        process.env.LIBREOFFICE_PATH ||
        'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

      const profileUrl =
        pathToFileURL(profilePath).href;

      const { stdout, stderr } =
        await execFileAsync(
          sofficePath,
          [
            `-env:UserInstallation=${profileUrl}`,
            '--headless',
            '--convert-to',
            'pdf:writer_pdf_Export',
            '--outdir',
            tempDir,
            inputPath,
          ],
          {
            timeout: 45000,
            windowsHide: true,
          },
        );

      if (stderr.trim()) {
        this.logger.warn(stderr.trim());
      }

      if (stdout.trim()) {
        this.logger.debug(stdout.trim());
      }

      const pdfBuffer =
        await readFile(outputPath);

      if (
        pdfBuffer.length < 5 ||
        pdfBuffer.subarray(0, 5).toString() !== '%PDF-'
      ) {
        throw new Error(
          'O LibreOffice não gerou um PDF válido.',
        );
      }

      return pdfBuffer;
    } finally {
      await rm(tempDir, {
        recursive: true,
        force: true,
      });
    }
  }
}
