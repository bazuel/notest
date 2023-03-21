import { BLMonitor, BLWheelEvent, throttle } from '@notest/common';
import { on } from '../utils/on.event';
import { blevent } from '../model/dispatched.events';

export class WheelMonitor implements BLMonitor {
  private disableWheel: () => any = () => {};

  enable(): void {
    const updatePosition = throttle((evt) => {
      this.manageWheelEvent(evt as WheelEvent);
    }, 5);
    this.disableWheel = on('wheel', updatePosition);
  }

  manageWheelEvent(evt) {
    let deltaX = evt.deltaX;
    let deltaY = evt.deltaY;
    let data: Partial<BLWheelEvent> = {
      deltaX,
      deltaY,
      target: evt.target!,
      currentTarget: evt.currentTarget!
    };
    blevent.mouse.wheel(data);
  }

  disable(): void {
    this.disableWheel();
  }
}
