
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { TemplateLoaderService } from './services/template-loader.service.js';
import { DocxGeneratorService } from './services/docx-generator.service.js';

import type {
  CreateResumeInput,
} from '../resumes/schemas/resume.schema.js';

async function main() {
  // Inicializa os serviços
  const loader = new TemplateLoaderService();
  const generator = new DocxGeneratorService(loader);

  // Dados fictícios para testar a geração completa
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
      'Desenvolvedor de software com experiência em desenvolvimento backend, APIs REST e bancos de dados relacionais. Conhecimento em TypeScript, Node.js e PostgreSQL. Busca oportunidades para contribuir com soluções tecnológicas.',

    experiences: [
      {
        id: '11111111-1111-4111-8111-111111111111',
        company: 'Tech Solutions',
        role: 'Desenvolvedor Backend',
        startDate: '2025',
        endDate: '',
        isCurrent: true,
        description:
          'Desenvolvimento de APIs REST utilizando Node.js e TypeScript.\nIntegração com bancos de dados PostgreSQL.\nImplementação de autenticação JWT.',
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        company: 'Inova Sistemas',
        role: 'Estagiário de Desenvolvimento',
        startDate: '2024',
        endDate: '2025',
        isCurrent: false,
        description:
          'Manutenção de aplicações web.\nCorreção de bugs e implementação de funcionalidades.',
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

  console.log('Iniciando geração do currículo...');

  // Gera o currículo completo com o Modelo 01
  const document = await generator.generateResume(
    'modelo-01',
    content,
  );

  // Caminho de saída
  const outputPath = join(
    process.cwd(),
    'curriculo-completo-teste.docx',
  );

  // Salva o DOCX gerado
  await writeFile(outputPath, document);

  console.log('Currículo completo gerado com sucesso!');
  console.log(`Arquivo: ${outputPath}`);
}

main().catch((error) => {
  console.error('Erro ao gerar currículo:', error);
  process.exitCode = 1;
});
