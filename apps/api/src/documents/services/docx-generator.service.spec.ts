
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import PizZip from 'pizzip';

import { DocxGeneratorService } from './docx-generator.service.js';
import { TemplateLoaderService } from './template-loader.service.js';

import type { CreateResumeInput } from '../../resumes/schemas/resume.schema.js';

type ResumeContent = CreateResumeInput['content'];

describe('DocxGeneratorService', () => {
  let service: DocxGeneratorService;

  const loaderMock = {
    loadTemplate: vi.fn(),
  };

  const createTemplate = (body: string): Buffer => {
    const zip = new PizZip();

    zip.file(
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml"
          ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      </Types>`,
    );

    zip.file(
      '_rels/.rels',
      `<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1"
          Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
          Target="word/document.xml"/>
      </Relationships>`,
    );

    zip.file(
      'word/document.xml',
      `<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          ${body}
          <w:sectPr/>
        </w:body>
      </w:document>`,
    );

    return zip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  };

  const paragraph = (text: string): string =>
    `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`;

  const readDocumentXml = (buffer: Buffer): string => {
    const zip = new PizZip(buffer);

    const document = zip.file('word/document.xml');

    if (!document) {
      throw new Error('document.xml não encontrado');
    }

    return document.asText();
  };

  const content: ResumeContent = {
    personal: {
      fullName: 'Pessoa de Teste',
      email: 'teste@exemplo.com',
      phone: '11999999999',
      city: 'São Paulo',
      linkedin: 'linkedin.com/in/teste',
      website: '',
    },

    summary: 'Profissional de tecnologia.',

    experiences: [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        company: 'Empresa Exemplo',
        role: 'Desenvolvedor Backend',
        startDate: '2024',
        endDate: '',
        isCurrent: true,
        description: 'Desenvolvimento de APIs.',
      },
    ],

    education: [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        institution: 'Universidade Exemplo',
        course: 'Ciência da Computação',
        startDate: '2023',
        endDate: '2027',
        inProgress: false,
      },
    ],

    skills: ['TypeScript', 'NestJS', 'PostgreSQL'],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new DocxGeneratorService(
      loaderMock as unknown as TemplateLoaderService,
    );
  });

  it('deve preencher nome e informações de contato', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(
        paragraph('{fullName}') +
        paragraph('{contact}'),
      ),
    );

    const result = await service.generateResume(
      'modelo-01',
      content,
    );

    const xml = readDocumentXml(result);

    expect(xml).toContain('Pessoa de Teste');
    expect(xml).toContain('teste@exemplo.com');
    expect(xml).toContain('11999999999');
    expect(xml).toContain('São Paulo');
    expect(xml).toContain('linkedin.com/in/teste');

    expect(xml).not.toContain('{fullName}');
    expect(xml).not.toContain('{contact}');
  });

  it('deve preencher o resumo profissional', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(
        paragraph('{#hasSummary}') +
        paragraph('{summary}') +
        paragraph('{/hasSummary}'),
      ),
    );

    const result = await service.generateResume(
      'modelo-01',
      content,
    );

    expect(readDocumentXml(result)).toContain(
      'Profissional de tecnologia.',
    );
  });

  it('deve preencher experiências profissionais', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(
        paragraph('{#experiences}') +
        paragraph('{company}') +
        paragraph('{role}') +
        paragraph('{period}') +
        paragraph('{description}') +
        paragraph('{/experiences}'),
      ),
    );

    const result = await service.generateResume(
      'modelo-01',
      content,
    );

    const xml = readDocumentXml(result);

    expect(xml).toContain('Empresa Exemplo');
    expect(xml).toContain('Desenvolvedor Backend');
    expect(xml).toContain('2024 - Atual');
    expect(xml).toContain('Desenvolvimento de APIs.');
  });

  it('deve preencher a formação acadêmica', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(
        paragraph('{#education}') +
        paragraph('{institution}') +
        paragraph('{course}') +
        paragraph('{period}') +
        paragraph('{/education}'),
      ),
    );

    const result = await service.generateResume(
      'modelo-01',
      content,
    );

    const xml = readDocumentXml(result);

    expect(xml).toContain('Universidade Exemplo');
    expect(xml).toContain('Ciência da Computação');
    expect(xml).toContain('2023 - 2027');
  });

  it('deve preencher habilidades profissionais', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(
        paragraph('{#skills}') +
        paragraph('{name}') +
        paragraph('{/skills}'),
      ),
    );

    const result = await service.generateResume(
      'modelo-01',
      content,
    );

    const xml = readDocumentXml(result);

    expect(xml).toContain('TypeScript');
    expect(xml).toContain('NestJS');
    expect(xml).toContain('PostgreSQL');
  });

  it('deve omitir seções vazias', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(
        paragraph('{#hasSummary}') +
        paragraph('RESUMO_VISIVEL') +
        paragraph('{/hasSummary}') +
        paragraph('{#hasSkills}') +
        paragraph('HABILIDADES_VISIVEIS') +
        paragraph('{/hasSkills}'),
      ),
    );

    const result = await service.generateResume(
      'modelo-01',
      {
        ...content,
        summary: '',
        skills: [],
      },
    );

    const xml = readDocumentXml(result);

    expect(xml).not.toContain('RESUMO_VISIVEL');
    expect(xml).not.toContain('HABILIDADES_VISIVEIS');
  });

  it('deve gerar um arquivo DOCX com estrutura ZIP', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(paragraph('{fullName}')),
    );

    const result = await service.generateResume(
      'modelo-01',
      content,
    );

    expect(Buffer.isBuffer(result)).toBe(true);

    expect(result.subarray(0, 2).toString()).toBe('PK');

    expect(() => new PizZip(result)).not.toThrow();
  });

  it('deve solicitar o template selecionado', async () => {
    loaderMock.loadTemplate.mockResolvedValue(
      createTemplate(paragraph('{fullName}')),
    );

    await service.generateResume(
      'modelo-03',
      content,
    );

    expect(
      loaderMock.loadTemplate,
    ).toHaveBeenCalledWith('modelo-03');
  });

  it('deve propagar erro quando o template não puder ser carregado', async () => {
    loaderMock.loadTemplate.mockRejectedValue(
      new Error('Template não encontrado'),
    );

    await expect(
      service.generateResume('modelo-01', content),
    ).rejects.toThrow('Template não encontrado');
  });
});
