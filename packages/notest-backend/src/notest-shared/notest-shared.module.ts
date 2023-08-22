import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { ProducerService } from './services/producer.service';
import { MediaController } from './controllers/media.controller';
import {
  AssertionService,
  assertionService,
  mediaService,
  MediaService,
  sessionService,
  SessionService
} from '@notest/backend-shared';
import { CronService } from './services/cron.service';

@Module({
  imports: [SharedModule],
  controllers: [MediaController],
  providers: [
    { provide: MediaService, useValue: mediaService },
    { provide: AssertionService, useValue: assertionService },
    { provide: SessionService, useValue: sessionService },
    ProducerService,
    CronService
  ],
  exports: [MediaService, ProducerService, SessionService, AssertionService, CronService]
})
export class NotestSharedModule {}
