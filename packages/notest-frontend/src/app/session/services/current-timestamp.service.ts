import { Injectable } from '@angular/core';
import { throttle } from '@notest/common';
@Injectable({
  providedIn: 'root'
})
export class CurrentTimestampService {
  handlers: ((ts: number) => void)[] = [];
  private readonly updater: (_ts: number) => void;
  private last: number = 0;

  constructor() {
    this.updater = throttle((ts) => {
      for (let h of this.handlers) h(ts as number);
    }, 100);
  }

  timestampUpdate(currentTimestamp: number) {
    this.last = currentTimestamp;
    this.updater(currentTimestamp);
  }

  onChange(handler: (currentTimestamp: number) => void) {
    this.handlers.push(handler);
  }

  isClose(timestamp: number) {
    return Math.abs(timestamp - this.last) < 600;
  }
}
