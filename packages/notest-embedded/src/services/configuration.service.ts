import { http } from './http.service';
import { NTMonitorConfiguration } from '@notest/common';

export class ConfigurationService {
  configuration!: NTMonitorConfiguration;

  async get() {
    this.configuration = await http.gest('/embedded/configuration', {
      domain: window.location.hostname
    });
    console.log('notest configuration: ', this.configuration);
    return this.configuration;
  }
}

export const configuration = new ConfigurationService();
