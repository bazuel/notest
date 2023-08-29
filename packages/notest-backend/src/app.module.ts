import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { TestGeneratorController } from './test-generator/test-generator.controller';
import { TestGeneratorService } from './test-generator/test-generator.service';
import { SessionController } from './session-event/session.controller';
import { EventService } from './session-event/event.service';
import { NotestSharedModule } from './notest-shared/notest-shared.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MessagesService } from './user/messages.service';
import { BatteryService } from './battery/battery.service';
import { BatteryController } from './battery/battery.controller';
import { WebhookController } from './webhook/webhook.controller';

@Module({
  imports: [SharedModule, NotestSharedModule],
  controllers: [AppController,BatteryController,
    WebhookController, TestGeneratorController, SessionController, UserController],
  providers: [AppService,
    BatteryService, TestGeneratorService, EventService, UserService, MessagesService]
})
export class AppModule {}
