
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ResumesModule } from './resumes/resumes.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { AiModule } from './ai/ai.module.js';

@Module({
  imports: [PrismaModule, ResumesModule, SessionsModule,AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
