import { BLMonitor } from '@notest/common';
import { blevent } from '../model/dispatched.events';
import { on } from '../utils/on.event';

export class KeyboardMonitor implements BLMonitor {
  private disableMonitoring: () => void = () => {};

  enable(): void {
    let k: any[] = [];
    let ev = (e) => ({
      key: e.key,
      code: e.code,
      locale: (e as any).locale,
      modifier: e.ctrlKey ? 'ctrl' : e.altKey ? 'alt' : e.shiftKey ? 'shift' : 'none',
      target: e.target
    });
    k.push(on('keyup', (e: Event) => (e as KeyboardEvent).code && blevent.keyboard.up(ev(e))));
    k.push(on('keydown', (e: Event) => (e as KeyboardEvent).code && blevent.keyboard.down(ev(e))));
    this.disableMonitoring = () =>
      k.forEach((restore) => {
        restore();
      });
  }

  disable(): void {
    this.disableMonitoring();
  }
}
