
import 'dotenv/config';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { PrismaService } from '../prisma/prisma.service.js';
import { ResumesService } from '../resumes/resumes.service.js';
import { ResumeDocumentService } from '../resumes/resume-document.service.js';

import { TemplateLoaderService } from './services/template-loader.service.js';
import { DocxGeneratorService } from './services/docx-generator.service.js';
import { PdfGeneratorService } from './services/pdf-generator.service.js';
import { PdfWatermarkService } from './services/pdf-watermark.service.js';

async function main() {
  const prisma = new PrismaService();

  try {
    console.log('Conectando ao PostgreSQL...');

    await prisma.$connect();

    // 1. Busca o currículo mais recente que possui
    // um dos três modelos selecionados.
    const resume = await prisma.resume.findFirst({
      where: {
        templateId: {
          in: [
            'modelo-01',
            'modelo-02',
            'modelo-03',
          ],
        },
        sessionId: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resume) {
      throw new Error(
        'Nenhum currículo com modelo e sessão foi encontrado.',
      );
    }

    // 2. Garante que o currículo possui uma sessão.
    if (!resume.sessionId) {
      throw new Error(
        'O currículo encontrado não possui uma sessão associada.',
      );
    }

    console.log('Currículo encontrado:', resume.id);
    console.log('Modelo selecionado:', resume.templateId);

    // 3. Inicializa os serviços necessários.
    const templateLoader = new TemplateLoaderService();

    const docxGenerator = new DocxGeneratorService(
      templateLoader,
    );

   const pdfGenerator = new PdfGeneratorService();

const pdfWatermark = new PdfWatermarkService();

const resumesService = new ResumesService(prisma);

const resumeDocumentService = new ResumeDocumentService(
  resumesService,
  docxGenerator,
  pdfGenerator,
  
);

    // 4. Gera o documento Word com os dados reais.
    console.log('Gerando DOCX...');

    const docxBuffer =
      await resumeDocumentService.generateDocx(
        resume.sessionId,
        resume.id,
      );

    const docxOutputPath = join(
      process.cwd(),
      'curriculo-banco-teste.docx',
    );

    await writeFile(docxOutputPath, docxBuffer);

    console.log('DOCX gerado com sucesso!');
    console.log('Arquivo:', docxOutputPath);

    // 5. Gera o PDF utilizando o mesmo currículo.
    console.log('Gerando PDF...');

    const pdfBuffer =
      await resumeDocumentService.generatePdf(
        resume.sessionId,
        resume.id,
      );

    const pdfOutputPath = join(
      process.cwd(),
      'curriculo-banco-teste.pdf',
    );

    await writeFile(pdfOutputPath, pdfBuffer);

    console.log('PDF gerado com sucesso!');
    console.log('Arquivo:', pdfOutputPath);

    // 6. Exibe o resultado final.
    console.log('\n================================');
    console.log('TESTE FINALIZADO COM SUCESSO!');
    console.log('================================');
    console.log('Currículo:', resume.id);
    console.log('Modelo:', resume.templateId);
    console.log('DOCX:', docxOutputPath);
    console.log('PDF:', pdfOutputPath);
    console.log('================================\n');
  } catch (error) {
    console.error('Erro ao gerar documentos:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('Conexão com PostgreSQL encerrada.');
  }
}

main().catch((error) => {
  console.error('Erro inesperado:', error);
  process.exitCode = 1;
});
