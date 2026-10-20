
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

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

  @Post()
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
      'Content-Disposition': 'inline; filename="curriculo-previa.pdf"',
      'Content-Length': pdfBuffer.length,
      'Cache-Control': 'no-store, private',
      'X-Content-Type-Options': 'nosniff',
    });

    response.end(pdfBuffer);
  }

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
}
