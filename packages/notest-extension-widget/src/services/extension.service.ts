import { messageService } from './message.service';
import { storageService } from '../shared/services/storage.service';

class ExtensionService {
  private _reference: string;

  start(cleanSession?: boolean) {
    messageService.sendMessage('start-recording', { 'clean-session': cleanSession });
  }

  async stop() {
    await messageService.sendMessage('stop-recording', {}, true);
  }

  cancel() {
    messageService.sendMessage('cancel-recording', {});
  }

  save(sessionInfo: {
    title: string;
    description: string;
    targetList: any[];
    isLogin: boolean;
    rerun: boolean;
    reference: string;
  }) {
    postMessage({ type: 'save-session', data: sessionInfo }, '*');
  }

  async recording() {
    const recording = await messageService.sendMessage('recording', {}, true);
    return recording['recording'];
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
