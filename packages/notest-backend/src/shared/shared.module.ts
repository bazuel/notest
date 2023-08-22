import { Module } from '@nestjs/common';
import {
  ConfigService,
  configService,
  db,
  globalConfig,
  kafkaService,
  KafkaService,
  PostgresDbService,
  StorageService,
  storageService
} from '@notest/backend-shared';
import { CrudService } from './services/crud.service';
import { TimeService } from './services/time.service';
import { CryptService } from './services/crypt.service';
import { TokenService } from './services/token.service';
import { EmailService } from './services/email.service';
import { InjectorService } from './functions/find-injected-service.function';

@Module({
  providers: [
    PostgresDbService,
    CrudService,
    TimeService,
    InjectorService,
    { provide: EmailService, useValue: new EmailService(globalConfig.email) },
    { provide: CryptService, useValue: new CryptService(globalConfig.master_password) },
    { provide: TokenService, useValue: new TokenService(globalConfig.master_password) },
    { provide: KafkaService, useValue: kafkaService },
    { provide: PostgresDbService, useValue: db },
    { provide: ConfigService, useValue: configService },
    { provide: StorageService, useValue: storageService }
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
