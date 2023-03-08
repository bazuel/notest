import { Module } from '@nestjs/common';
import { PostgresDbService } from './services/postgres-db.service';
import { ConfigService, globalConfig } from './services/config.service';
import { CrudService } from './services/crud.service';
import { TimeService } from './services/time.service';
import { StorageService } from './services/storage.service';
import { CryptService } from './services/crypt.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { InjectorService } from './functions/find-injected-service.function';
import {KafkaService} from "./services/kafka.service";

@Module({
  providers: [
    PostgresDbService,
    ConfigService,
    CrudService,
    TimeService,
    StorageService,
    { provide: EmailService, useValue: new EmailService(globalConfig.email) },
    {
      provide: CryptService,
      useValue: new CryptService(globalConfig.master_password)
    },
    {
      provide: TokenService,
      useValue: new TokenService(globalConfig.master_password)
    },
    InjectorService,
    {
      provide: KafkaService,
      useValue: new KafkaService(globalConfig.broker)
    }
  ],
  exports: [
    PostgresDbService,
    CrudService,
    ConfigService,
    TimeService,
    StorageService,
    CryptService,
    EmailService,
    TokenService,
    InjectorService,
    KafkaService
  ]
})
export class SharedModule {}
