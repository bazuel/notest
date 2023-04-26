import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { InstrumentedEventController } from './instrumented-event/instrumented-event.controller';
import { StoryController } from './story/story.controller';
import { TestGeneratorController } from './test-generator/test-generator.controller';
import { InstrumentedEventService } from './instrumented-event/instrumented-event.service';
import { StoryService } from './story/story.service';
import { TestGeneratorService } from './test-generator/test-generator.service';
import { SessionController } from './session-event/session.controller';
import { EventService } from './session-event/event.service';
import { NotestSharedModule } from './notest-shared/notest-shared.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MessagesService } from './user/messages.service';

@Module({
  imports: [SharedModule, NotestSharedModule],
  controllers: [
    AppController,
    InstrumentedEventController,
    StoryController,
    TestGeneratorController,
    SessionController,
    UserController
  ],
  providers: [
    AppService,
    InstrumentedEventService,
    StoryService,
    TestGeneratorService,
    EventService,
    UserService,
    MessagesService
  ]
})
export class AppModule {}
