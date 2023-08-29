import { messageService } from './message.service';
import { storageService } from '../shared/services/storage.service';

class ExtensionService {
  private _reference: string;

  start(cleanSession?: boolean) {
    localStorage.setItem('nt-recording', '1');
    messageService.sendMessage('start-recording', { 'clean-session': cleanSession });
  }

  async stop() {
    localStorage.setItem('nt-recording', '0');
    await messageService.sendMessage('stop-recording', {}, true);
  }

  cancel() {
    localStorage.setItem('nt-recording', '0');
    messageService.sendMessage('cancel-recording', {});
  }

  save(sessionInfo: {
    title: string;
    description: string;
    targetList: any[];
    isLogin: boolean;
    reference: string;
  }) {
    postMessage({ type: 'save-session', data: sessionInfo }, '*');
  }

  get recording() {
    return localStorage.getItem('nt-recording') === '1';
  }

  saveReference(reference: string) {
    this._reference = reference;
  }

  get reference() {
    return this._reference;
  }

  set customBackendUrl(url: string) {
    storageService.setLocal('nt_custom_api_url', url);
  }

  async getCustomBackendUrl() {
    return await storageService.getLocal('nt_custom_api_url');
  }

  async referenceAvailable() {
    return new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        if (this._reference) resolve(true);
        else reject('Reference not found');
      }, 1000);
    });
  }
}

export const extensionService = new ExtensionService();
