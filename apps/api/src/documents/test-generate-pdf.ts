
import 'dotenv/config';

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { PdfGeneratorService } from './services/pdf-generator.service.js';

async function main() {
  const inputPath = join(
    process.cwd(),
    'curriculo-banco-teste.docx',
  );

  const outputPath = join(
    process.cwd(),
    'curriculo-automatico-teste.pdf',
  );

  const docxBuffer = await readFile(inputPath);

  const pdfGenerator = new PdfGeneratorService();

  const pdfBuffer = await pdfGenerator.convertDocxToPdf(
    docxBuffer,
  );

  await writeFile(outputPath, pdfBuffer);

  console.log('PDF gerado automaticamente!');
  console.log('Arquivo:', outputPath);
  console.log('Tamanho:', pdfBuffer.length, 'bytes');
}

main().catch((error) => {
  console.error('Erro no teste:', error);
  process.exitCode = 1;
});
