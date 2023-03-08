import { BLMonitor } from '@notest/common';
import { blevent } from '../model/dispatched.events';
import { observeMethod } from '../utils/method.observer';

export class PageMonitor implements BLMonitor {
  private disableMonitoring: () => void = () => {};

  enable(): void {
    let pageHash = '';
    let pageAddress = '';
    let prevVisibility = false;
    let vch = (_) => {
      if (prevVisibility != !document.hidden) {
        prevVisibility = !document.hidden;
        blevent.page.visibility({ active: !document.hidden });
      }
    };
    const hch = (_) => {
      if (pageHash != window.location.hash) {
        pageHash = window.location.hash;
        blevent.page.hash({ hash: window.location.hash });
      }
    };
    const ach = (_?) => {
      if (pageAddress != window.location.href) {
        pageAddress = window.location.href;
        blevent.page.address({ address: window.location.href });
      }
    };
    const nch_online = (_) => {
      blevent.page.network({ online: true });
    };
    const nch_offline = (_) => {
      blevent.page.network({ online: false });
    };
    document.addEventListener('visibilitychange', vch);
    window.addEventListener('hashchange', hch);
    window.addEventListener('offline', nch_offline);
    window.addEventListener('online', nch_online);
    const restorePushState = observeMethod(window.history, 'pushState', (_) => {
      ach();
    });
    const restoreReplaceState = observeMethod(window.history, 'replaceState', (_) => {
      ach();
    });
    window.addEventListener('popstate', ach);

    const visibilityCheck = setInterval(vch, 1000);

    this.disableMonitoring = () => {
      window.removeEventListener('hashchange', hch);
      document.removeEventListener('visibilitychange', vch);
      window.removeEventListener('online', nch_online);
      window.removeEventListener('offline', nch_offline);
      window.removeEventListener('popstate', ach);
      restorePushState();
      restoreReplaceState();
      clearInterval(visibilityCheck);
    };

    blevent.page.referrer({ referrer: document.referrer, url: document.URL });
  }

  disable(): void {
    this.disableMonitoring();
  }
}
