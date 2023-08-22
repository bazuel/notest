import { messageService } from '../../shared/services/message.service';

class ExtensionService {
  set customBackendUrl(url: string) {
    messageService.sendMessage('set-storage', { key: 'nt_custom_api_url', value: url });
  }

  async getCustomBackendUrl(): Promise<string> {
    return new Promise(async (resolve) => {
      setTimeout(() => {
        resolve('');
      }, 2000);
      const response = await messageService.sendMessage<{ value: string }>(
        'get-storage',
        { key: 'nt_custom_api_url' },
        true
      );
      resolve(response?.value || '');
    });
  }
}

export const extensionService = new ExtensionService();
