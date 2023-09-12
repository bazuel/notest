import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EmbeddedService } from './embedded.service';
import { NTEmbeddedConfiguration } from '@notest/common';
import { UserId } from '../shared/decorators/token.decorator';

@Controller('embedded')
export class EmbeddedController {
  constructor(private embeddedService: EmbeddedService) {}

  @Get('configuration')
  async embeddedConfiguration(@Query('domain') domain: string) {
    const [config] = await this.embeddedService.findByField('domain', domain);
    return config;
  }

  @Post('save-configuration')
  async saveEmbeddedConfiguration(
    @Body('configuration') configuration: NTEmbeddedConfiguration,
    @UserId() userid: string
  ) {
    if (configuration.id) {
      await this.embeddedService.update(configuration);
      return configuration;
    } else {
      configuration.userid = userid;
      const [result] = await this.embeddedService.create(configuration);
      return result;
    }
  }

  @Get('find-by-user')
  async findByUser(@UserId() userid: string) {
    return await this.embeddedService.findByField('userid', userid);
  }
}
