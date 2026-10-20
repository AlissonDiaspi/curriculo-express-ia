
import { Module } from '@nestjs/common';

import { ResumesController } from './resumes.controller.js';
import { ResumesService } from './resumes.service.js';
import { ResumeDocumentService } from './resume-document.service.js';

import { SessionsModule } from '../sessions/sessions.module.js';
import { DocumentsModule } from '../documents/documents.module.js';

@Module({
  imports: [
    SessionsModule,
    DocumentsModule,
  ],
  controllers: [
    ResumesController,
  ],
  providers: [
    ResumesService,
    ResumeDocumentService,
  ],
})
export class ResumesModule {}
