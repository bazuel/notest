import { http } from './http.service';
import { NTEmbeddedConfiguration } from '@notest/common';

export class ConfigurationService {
  configuration!: NTEmbeddedConfiguration;

  async get() {
    this.configuration = await http.gest('/embedded/configuration', {
      domain: window.location.hostname
    });
    console.log('notest configuration: ', this.configuration);
    return this.configuration;
  }
}

export const configuration = new ConfigurationService();
