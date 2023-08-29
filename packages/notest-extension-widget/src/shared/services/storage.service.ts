import { messageService } from '../../services/message.service';

class StorageService {
  async getLocal(key: string) {
    const response = await messageService.sendMessage<{ value: string }>(
      'get-storage',
      { key },
      true
    );
    return response.value || '';
  }

  setLocal(key: string, value: string) {
    messageService.sendMessage('set-storage', { key, value });
  }
}

export const storageService = new StorageService();
