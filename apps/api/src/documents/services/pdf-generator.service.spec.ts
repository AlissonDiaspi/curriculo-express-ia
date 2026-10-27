
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { InternalServerErrorException } from '@nestjs/common';

const mocks = vi.hoisted(() => ({
  mkdtemp: vi.fn(),
  readFile: vi.fn(),
  rm: vi.fn(),
  writeFile: vi.fn(),
  execFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  mkdtemp: mocks.mkdtemp,
  readFile: mocks.readFile,
  rm: mocks.rm,
  writeFile: mocks.writeFile,
}));

vi.mock('node:child_process', () => ({
  execFile: mocks.execFile,
}));

vi.mock('node:util', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('node:util')>();

  return {
    ...original,
    promisify: () => mocks.execFile,
  };
});

import { PdfGeneratorService } from './pdf-generator.service.js';

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  const docxBuffer = Buffer.from('DOCX-DE-TESTE');

  const pdfBuffer = Buffer.from(
    '%PDF-1.7\nPDF-DE-TESTE',
  );

  const tempDir = 'C:\\temp\\curriculo-express-teste';

  const originalLibreOfficePath =
    process.env.LIBREOFFICE_PATH;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    delete process.env.LIBREOFFICE_PATH;

    service = new PdfGeneratorService();

    mocks.mkdtemp.mockResolvedValue(tempDir);
    mocks.writeFile.mockResolvedValue(undefined);
    mocks.readFile.mockResolvedValue(pdfBuffer);
    mocks.rm.mockResolvedValue(undefined);

    mocks.execFile.mockResolvedValue({
      stdout: '',
      stderr: '',
    });
  });

  afterEach(() => {
    vi.useRealTimers();

    if (originalLibreOfficePath === undefined) {
      delete process.env.LIBREOFFICE_PATH;
    } else {
      process.env.LIBREOFFICE_PATH =
        originalLibreOfficePath;
    }
  });

  it('deve converter DOCX em PDF válido', async () => {
    const result =
      await service.convertDocxToPdf(docxBuffer);

    expect(result).toEqual(pdfBuffer);

    expect(mocks.execFile).toHaveBeenCalledTimes(1);

    expect(mocks.readFile).toHaveBeenCalledWith(
      expect.stringContaining('curriculo.pdf'),
    );
  });

  it('deve escrever o DOCX antes da conversão', async () => {
    await service.convertDocxToPdf(docxBuffer);

    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('curriculo.docx'),
      docxBuffer,
    );
  });

  it('deve utilizar caminho personalizado do LibreOffice', async () => {
    process.env.LIBREOFFICE_PATH =
      'C:\\LibreOffice\\soffice.exe';

    await service.convertDocxToPdf(docxBuffer);

    expect(mocks.execFile).toHaveBeenCalledWith(
      'C:\\LibreOffice\\soffice.exe',
      expect.arrayContaining([
        '--headless',
        '--convert-to',
        'pdf:writer_pdf_Export',
      ]),
      expect.objectContaining({
        timeout: 45000,
        windowsHide: true,
      }),
    );
  });

  it('deve remover arquivos temporários após sucesso', async () => {
    await service.convertDocxToPdf(docxBuffer);

    expect(mocks.rm).toHaveBeenCalledWith(
      tempDir,
      {
        recursive: true,
        force: true,
      },
    );
  });

  it('deve tentar novamente após falha', async () => {
    mocks.execFile
      .mockRejectedValueOnce(
        new Error('Falha temporária'),
      )
      .mockResolvedValueOnce({
        stdout: '',
        stderr: '',
      });

    const conversion =
      service.convertDocxToPdf(docxBuffer);

    const expectation = expect(
      conversion,
    ).resolves.toEqual(pdfBuffer);

    await vi.runAllTimersAsync();

    await expectation;

    expect(mocks.execFile).toHaveBeenCalledTimes(2);
  });

  it('deve rejeitar arquivo que não seja PDF', async () => {
    mocks.readFile.mockResolvedValue(
      Buffer.from('ARQUIVO-INVALIDO'),
    );

    const conversion =
      service.convertDocxToPdf(docxBuffer);

    const expectation = expect(
      conversion,
    ).rejects.toThrow(
      InternalServerErrorException,
    );

    await vi.runAllTimersAsync();

    await expectation;

    expect(mocks.execFile).toHaveBeenCalledTimes(2);
  });

  it('deve retornar erro 500 após duas falhas', async () => {
    mocks.execFile.mockRejectedValue(
      new Error('LibreOffice indisponível'),
    );

    const conversion =
      service.convertDocxToPdf(docxBuffer);

    const expectation = expect(
      conversion,
    ).rejects.toThrow(
      InternalServerErrorException,
    );

    await vi.runAllTimersAsync();

    await expectation;

    expect(mocks.execFile).toHaveBeenCalledTimes(2);
  });

  it('deve remover arquivos temporários após falha', async () => {
    mocks.execFile.mockRejectedValue(
      new Error('Falha na conversão'),
    );

    const conversion =
      service.convertDocxToPdf(docxBuffer);

    const expectation = expect(
      conversion,
    ).rejects.toThrow(
      InternalServerErrorException,
    );

    await vi.runAllTimersAsync();

    await expectation;

    expect(mocks.rm).toHaveBeenCalledTimes(2);

    expect(mocks.rm).toHaveBeenCalledWith(
      tempDir,
      {
        recursive: true,
        force: true,
      },
    );
  });
});
