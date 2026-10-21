
import { Module } from '@nestjs/common';

import { AiController } from './ai.controller.js';
import { GeminiService } from './services/gemini.service.js';
import { AiUsageService } from './services/ai-usage.service.js';

import { SessionsModule } from '../sessions/sessions.module.js';
import { ResumesModule } from '../resumes/resumes.module.js';

@Module({
  imports: [
    SessionsModule,
    ResumesModule,
  ],
  controllers: [AiController],
  providers: [
    GeminiService,
    AiUsageService,
  ],
  exports: [GeminiService],
})
export class AiModule {}
