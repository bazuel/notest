import { messageService } from '../../services/message.service';

class HttpService {
  get(url: string) {
    return messageService.sendMessage('fetch', { method: 'GET', url }, true);
  }

  post<T>(url: string, body: any): Promise<T> {
    return messageService.sendMessage('fetch', { method: 'POST', url, body }, true);
  }
}

export const http = new HttpService();
