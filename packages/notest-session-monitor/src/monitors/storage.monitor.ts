import { blevent } from '../model/dispatched.events';
import { BLMonitor } from '@notest/common';

export class StorageMonitor implements BLMonitor {
  private disableMonitoring: () => void = () => {};

  constructor(
    private options: { intervalTimeForFullEvent: number } = { intervalTimeForFullEvent: -1 }
  ) {}

  serializeStorage(storage) {
    const ls = {};
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      const v = storage.getItem(k);
      ls[k] = v;
    }
    return { storage: ls };
  }

  fireFullEvents() {
    blevent.storage.session_full(this.serializeStorage(sessionStorage));
    blevent.storage.local_full(this.serializeStorage(localStorage));
  }

  enable(): void {
    this.fireFullEvents();
    let full;
    if (this.options.intervalTimeForFullEvent > 0) {
      full = setInterval(() => {
        this.fireFullEvents();
      }, this.options.intervalTimeForFullEvent);
    }

    let el = (e: StorageEvent) => {
      if (e.key) {
        let v = {};
        v[e.key] = e.newValue;
        if (e.storageArea === localStorage) blevent.storage.local_update({ storage: v });
        else blevent.storage.session_update({ storage: v });
      }
    };
    window.addEventListener('storage', el);

    this.disableMonitoring = () => {
      window.removeEventListener('storage', el);
      if (full) clearInterval(full);
    };
  }

  disable(): void {
    this.disableMonitoring();
  }
}
