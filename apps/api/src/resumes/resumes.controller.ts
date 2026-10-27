
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';

import type { Response } from 'express';

import { ZodError } from 'zod';

import { ResumesService } from './resumes.service.js';
import { ResumeDocumentService } from './resume-document.service.js';

import {
  createResumeSchema,
  updateResumeSchema,
} from './schemas/resume.schema.js';

import {
  SessionGuard,
  type AuthenticatedRequest,
} from '../sessions/guards/session/session.guard.js';

@Controller('resumes')
@UseGuards(SessionGuard)
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly resumeDocumentService: ResumeDocumentService,
  ) {}

  private getSessionId(
    request: AuthenticatedRequest,
  ): string {
    if (!request.sessionId) {
      throw new UnauthorizedException(
        'Sessão não identificada',
      );
    }

    return request.sessionId;
  }

  /**
   * Cria um novo currículo.
   */
  @Post()
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    try {
      const data = createResumeSchema.parse(body);

      return this.resumesService.create(
        this.getSessionId(request),
        data,
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Dados inválidos',
          errors: error.issues,
        });
      }

      throw error;
    }
  }

  /**
   * Busca um currículo da sessão atual.
   */
  @Get(':id')
  findOne(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.resumesService.findOne(
      this.getSessionId(request),
      id,
    );
  }

  /**
   * Gera a prévia do currículo em PDF.
   */
  @Get(':id/preview')
  async preview(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const pdfBuffer =
      await this.resumeDocumentService.generatePreview(
        this.getSessionId(request),
        id,
      );

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'inline; filename="curriculo-previa.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    });

    response.end(pdfBuffer);
  }

  /**
   * Atualiza os dados de um currículo.
   */
  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    try {
      const data = updateResumeSchema.parse(body);

      return this.resumesService.update(
        this.getSessionId(request),
        id,
        data,
      );
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Dados inválidos',
          errors: error.issues,
        });
      }

      throw error;
    }
  }

  /**
   * Baixa o currículo em PDF.
   */
  @Get(':id/download/pdf')
  async downloadPdf(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const pdfBuffer =
      await this.resumeDocumentService.generatePdf(
        this.getSessionId(request),
        id,
      );

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition':
        'attachment; filename="curriculo.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    });

    response.end(pdfBuffer);
  }

  /**
   * Baixa o currículo em Word .
   */
  @Get(':id/download/docx')
  async downloadDocx(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() response: Response,
  ) {
    const docxBuffer =
      await this.resumeDocumentService.generateDocx(
        this.getSessionId(request),
        id,
      );

    response.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition':
        'attachment; filename="curriculo.docx"',
      'Content-Length': docxBuffer.length,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    });

    response.end(docxBuffer);
  }
}
