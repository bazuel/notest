import { Controller, Get, Query } from '@nestjs/common';
import { EmbeddedService } from './embedded.service';

@Controller('embedded')
export class EmbeddedController {
  constructor(private embeddedService: EmbeddedService) {}

  @Get('configuration')
  async embeddedConfiguration(@Query('domain') domain: string) {
    const [{ configuration }] = await this.embeddedService.findByField('domain', domain);
    return configuration;
  }
}
