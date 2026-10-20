
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

import type {
  CreateResumeInput,
  UpdateResumeInput,
} from './schemas/resume.schema.js';

@Injectable()
export class ResumesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    sessionId: string,
    data: CreateResumeInput,
  ) {
    return this.prisma.resume.create({
      data: {
        title: data.title,

        templateId: data.templateId,

        content: data.content as Prisma.InputJsonValue,

        sessionId,
      },
    });
  }

  async findOne(
    sessionId: string,
    id: string,
  ) {
    const resume = await this.prisma.resume.findFirst({
      where: {
        id,
        sessionId,
      },
    });

    if (!resume) {
      throw new NotFoundException(
        'Currículo não encontrado',
      );
    }

    return resume;
  }

  async update(
    sessionId: string,
    id: string,
    data: UpdateResumeInput,
  ) {
    const result = await this.prisma.resume.updateMany({
      where: {
        id,
        sessionId,
      },

      data: {
        ...(data.title !== undefined && {
          title: data.title,
        }),

        ...(data.templateId !== undefined && {
          templateId: data.templateId,
        }),

        ...(data.content !== undefined && {
          content: data.content as Prisma.InputJsonValue,
        }),
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(
        'Currículo não encontrado',
      );
    }

    return this.findOne(sessionId, id);
  }
}
