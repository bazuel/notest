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

@Module({
  imports: [SharedModule],
  controllers: [MediaController],
  providers: [
    { provide: MediaService, useValue: mediaService },
    { provide: AssertionService, useValue: assertionService },
    { provide: SessionService, useValue: sessionService },
    ProducerService
  ],
  exports: [MediaService, ProducerService, SessionService, AssertionService]
})
export class NotestSharedModule {}
