
import { Module } from '@nestjs/common';

import { SessionsController } from './sessions.controller.js';
import { SessionsService } from './sessions.service.js';
import { SessionGuard } from './guards/session/session.guard.js';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, SessionGuard],
  exports: [SessionsService, SessionGuard],
})
export class SessionsModule {}
