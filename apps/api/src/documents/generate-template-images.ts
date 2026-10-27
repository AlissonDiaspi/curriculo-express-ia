
import 'dotenv/config';

import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { createCanvas } from '@napi-rs/canvas';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

import { TemplateLoaderService } from './services/template-loader.service.js';
import { DocxGeneratorService } from './services/docx-generator.service.js';
import { PdfGeneratorService } from './services/pdf-generator.service.js';

import type {
  CreateResumeInput,
} from '../resumes/schemas/resume.schema.js';

const TEMPLATE_IDS = [
  'modelo-01',
  'modelo-02',
  'modelo-03',
] as const;

// Dados fictícios para demonstrar os modelos.
const content: CreateResumeInput['content'] = {
  personal: {
    fullName: 'João da Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    city: 'São Paulo, SP',
    linkedin: 'linkedin.com/in/joaodasilva',
    website: '',
  },

  summary:
    'Desenvolvedor de software com experiência em desenvolvimento backend, APIs REST e bancos de dados relacionais. Conhecimento em TypeScript, Node.js e PostgreSQL.',

  experiences: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      company: 'Tech Solutions',
      role: 'Desenvolvedor Backend',
      startDate: '2025',
      endDate: '',
      isCurrent: true,
      description:
        'Desenvolvimento de APIs REST utilizando Node.js e TypeScript.\nIntegração com PostgreSQL e implementação de autenticação JWT.',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      company: 'Inova Sistemas',
      role: 'Estagiário de Desenvolvimento',
      startDate: '2024',
      endDate: '2025',
      isCurrent: false,
      description:
        'Manutenção de aplicações web.\nCorreção de bugs e implementação de novas funcionalidades.',
    },
  ],

  education: [
    {
      id: '33333333-3333-4333-8333-333333333333',
      institution: 'Universidade Exemplo',
      course: 'Bacharelado em Ciência da Computação',
      startDate: '2024',
      endDate: '',
      inProgress: true,
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      institution: 'Instituto Técnico Exemplo',
      course: 'Técnico em Informática',
      startDate: '2021',
      endDate: '2023',
      inProgress: false,
    },
  ],

  skills: [
    'TypeScript',
    'JavaScript',
    'Node.js',
    'NestJS',
    'PostgreSQL',
    'Git',
    'Docker',
  ],
};

/**
 * Converte a primeira página do PDF em PNG.
 */
async function pdfToPng(
  pdfBuffer: Buffer,
): Promise<Buffer> {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
  });

  try {
    const pdfDocument = await loadingTask.promise;

    const page = await pdfDocument.getPage(1);

    const viewport = page.getViewport({
      scale: 2,
    });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height),
    );

    const context = canvas.getContext('2d');

    await page.render({
      canvas: canvas as unknown as
        Parameters<typeof page.render>[0]['canvas'],

      canvasContext: context as unknown as
        Parameters<typeof page.render>[0]['canvasContext'],

      viewport,
    }).promise;

    const imageBuffer = await canvas.encode('png');

    page.cleanup();

    return Buffer.from(imageBuffer);
  } finally {
    await loadingTask.destroy();
  }
}

/**
 * Gera as imagens de apresentação dos
 * três modelos, sem marcas d'água.
 */
async function main() {
  const loader = new TemplateLoaderService();

  const docxGenerator = new DocxGeneratorService(
    loader,
  );

  const pdfGenerator = new PdfGeneratorService();

  const outputDirectory = resolve(
    process.cwd(),
    '..',
    'web',
    'public',
    'templates',
  );

  await mkdir(outputDirectory, {
    recursive: true,
  });

  console.log('\n================================');
  console.log('GERAÇÃO DAS IMAGENS DOS MODELOS');
  console.log('================================\n');

  for (const templateId of TEMPLATE_IDS) {
    console.log(`Processando ${templateId}...`);

    // 1. Gera o DOCX com dados fictícios.
    const docxBuffer =
      await docxGenerator.generateResume(
        templateId,
        content,
      );

    console.log('DOCX gerado.');

    // 2. Converte para PDF sem marca d'água.
    const pdfBuffer =
      await pdfGenerator.convertDocxToPdf(
        docxBuffer,
      );

    console.log('PDF gerado.');

    // 3. Converte a primeira página em PNG.
    const pngBuffer = await pdfToPng(
      pdfBuffer,
    );

    console.log('PNG gerado.');

    // 4. Substitui a miniatura antiga.
    const outputPath = join(
      outputDirectory,
      `${templateId}.png`,
    );

    await writeFile(
      outputPath,
      pngBuffer,
    );

    console.log(`Imagem salva: ${outputPath}\n`);
  }

  console.log('================================');
  console.log('TODAS AS IMAGENS FORAM GERADAS!');
  console.log('================================\n');
}

main().catch((error) => {
  console.error(
    'Erro ao gerar imagens dos modelos:',
    error,
  );

  process.exitCode = 1;
});
