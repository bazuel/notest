import { BLMonitor } from '@notest/common';
import { blevent } from '../model/dispatched.events';

export class CookieMonitor implements BLMonitor {
  private interval;

  enable(): void {
    let lastCookies = '';

    this.interval = setInterval(() => {
      if (document.cookie != lastCookies) {
        lastCookies = document.cookie;
        blevent.cookie.data({ cookie: lastCookies });
      }
    }, 1000);
  }

  disable(): void {
    clearInterval(this.interval);
  }
}
