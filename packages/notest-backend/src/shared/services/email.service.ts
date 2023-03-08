import { Injectable } from '@nestjs/common';

const nodemailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');
const AWS = require('aws-sdk');

export interface EmailConfiguration {
  region: string;
  api_version: string;
  aws: {
    access_key_id: string;
    secret_access_key: string;
  };
  default_from: string;
}

@Injectable()
export class EmailService {
  private defaultFromEmail: string;
  private transporter;

  constructor(configuration: EmailConfiguration) {
    AWS.config.update({ region: configuration.region });
    process.env.AWS_ACCESS_KEY_ID = configuration.aws.access_key_id;
    process.env.AWS_SECRET_ACCESS_KEY = configuration.aws.secret_access_key;
    const ses = new aws.SES({
      apiVersion: configuration.api_version,
      region: configuration.region
    });
    this.transporter = nodemailer.createTransport({ SES: { ses, aws } });

    this.defaultFromEmail = configuration.default_from;
  }

  async send(to: string, subject: string, html: string, from?: string) {
    const message = {
      from: from || this.defaultFromEmail,
      to,
      subject,
      html
    };

    try {
      let result = await this.transporter.sendMail(message);
      return { sent: true };
    } catch (e) {
      console.log(`Could not send email`, e);
      return {};
    }
  }
}
