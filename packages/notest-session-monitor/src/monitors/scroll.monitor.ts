import { BLMonitor, BLScrollEvent, throttle } from '@notest/common';
import { on } from '../utils/on.event';
import { blevent } from '../model/dispatched.events';

export class ScrollMonitor implements BLMonitor {
  private disableScroll: () => any = () => {};

  enable(): void {
    const updatePosition = throttle((evt) => {
      this.manageScrollEvent(evt);
    }, 5);
    this.disableScroll = on('scroll', updatePosition);
  }

  manageScrollEvent(evt) {
    const scrollEl = evt.target as HTMLElement;
    let x = scrollEl.scrollLeft;
    let y = scrollEl.scrollTop;
    if (evt.target == document) {
      x = window.scrollX;
      y = window.scrollY;
    }
    let data: Partial<BLScrollEvent> = {
      x,
      y,
      target: evt.target,
      currentTarget: evt.currentTarget
    };
    if (evt.target === document) blevent.mouse.scroll(data);
    else blevent.mouse.elementscroll(data);
  }

  disable(): void {
    this.disableScroll();
  }
}
