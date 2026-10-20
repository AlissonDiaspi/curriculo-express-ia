
import { Module } from '@nestjs/common';

import { TemplateLoaderService } from './services/template-loader.service.js';

import { DocxGeneratorService } from './services/docx-generator.service.js';

import { PdfGeneratorService } from './services/pdf-generator.service.js';

import { PdfWatermarkService } from './services/pdf-watermark.service.js';

@Module({
  providers: [
    TemplateLoaderService,
    DocxGeneratorService,
    PdfGeneratorService,
    PdfWatermarkService,
  ],
  exports: [
    DocxGeneratorService,
    PdfGeneratorService,
    PdfWatermarkService,
  ],
})
export class DocumentsModule {}
