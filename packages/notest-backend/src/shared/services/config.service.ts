import { Injectable } from '@nestjs/common';
import { DBConfig } from './postgres-db.service';
import { StorageConfig } from './storage.service';

export interface Config {
  db: DBConfig;
  storage: StorageConfig;
  master_password: string;
  backend_url: string;
}

function initGlobalConfig() {
  const {
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    SSO_MASTER_PASSWORD,
    SSO_BACKEND_URL,
    SSO_DEFAULT_COLOR,
    SSO_EMAIL_AWS_REGION,
    SSO_EMAIL_AWS_API_VERSION,
    SSO_EMAIL_AWS_ACCESS_KEY_ID,
    SSO_EMAIL_AWS_SECRET_ACCESS_KEY,
    SSO_DEFAULT_FROM,
    APP_URL,
    DROPBOX_CLIENTID,
    DROPBOX_CLIENTSECRET,
    S3_ENDPOINT,
    S3_BUCKET,
    S3_ACCESS_KEY,
    S3_SECRET_KEY,
    KAFKA_BOOTSTRAP_BROKER_IP,
    KAFKA_BOOTSTRAP_BROKER_PORT,
    KAFKA_TOPIC
  } = process.env;

  return {
    dropbox: {
      clientId: DROPBOX_CLIENTID,
      clientSecret: DROPBOX_CLIENTSECRET
    },
    db: {
      host: DB_HOST,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: +DB_PORT
    },
    storage: {
      endpoint: S3_ENDPOINT,
      accessKey: S3_ACCESS_KEY,
      secretKey: S3_SECRET_KEY,
      bucket: S3_BUCKET
    },
    email: {
      aws: {
        access_key_id: SSO_EMAIL_AWS_ACCESS_KEY_ID,
        secret_access_key: SSO_EMAIL_AWS_SECRET_ACCESS_KEY
      },
      api_version: SSO_EMAIL_AWS_API_VERSION,
      default_from: SSO_DEFAULT_FROM,
      region: SSO_EMAIL_AWS_REGION
    },
    master_password: SSO_MASTER_PASSWORD,
    backend_url: SSO_BACKEND_URL,
    app_url: APP_URL,
    color: SSO_DEFAULT_COLOR || '#29ffad',
    broker: {
      endpoint: KAFKA_BOOTSTRAP_BROKER_IP,
      port: +KAFKA_BOOTSTRAP_BROKER_PORT,
      topic: KAFKA_TOPIC
    }
  };
}

export const globalConfig = initGlobalConfig();

@Injectable()
export class ConfigService implements Config {
  db: DBConfig;
  storage: StorageConfig;
  master_password: string;
  backend_url: string;
  app_url: string;
  color: string;
  dropbox: { clientId: string; clientSecret: string };

  constructor() {
    const gc = initGlobalConfig();
    for (let k in gc) globalConfig[k] = gc[k];
    this.db = globalConfig.db as DBConfig;
    this.master_password = globalConfig.master_password;
    this.backend_url = globalConfig.backend_url;
    this.app_url = globalConfig.app_url;
    this.color = globalConfig.color;
    this.dropbox = globalConfig.dropbox;
    this.storage = globalConfig.storage;
  }
}
