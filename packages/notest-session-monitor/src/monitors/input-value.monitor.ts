import { BLMonitor } from '@notest/common';
import { RequestAnimationFrameTimer } from '@notest/common';
import { observeProperty } from '../utils/property.observer';
import { blevent } from '../model/dispatched.events';

export class InputValueMonitor implements BLMonitor {
  private disableMonitoring: () => void = () => {};

  enable(): void {
    let values = new Map();
    let checked = new Map();

    let raf = new RequestAnimationFrameTimer();
    raf.start((ms) => {
      values.forEach((e) => {
        blevent.keyboard.value(e);
      });
      values.clear();
      checked.forEach((e) => {
        blevent.keyboard.checked(e);
      });
      checked.clear();
    });

    const valueSetter = {
      set(this: any) {
        if (this) values.set(this, { target: this, value: this.value });
      }
    };
    const checkedSetter = {
      set(this: any) {
        if (this) checked.set(this, { target: this, checked: this.checked });
      }
    };
    let restoreOriginals = [
      ...[HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement].map((e) =>
        observeProperty(e.prototype, 'value', valueSetter)
      ),
      observeProperty(HTMLInputElement.prototype, 'checked', checkedSetter)
    ];
    this.disableMonitoring = () => {
      restoreOriginals.forEach((restore) => {
        restore();
      });
      raf.stop();
    };
  }

  disable(): void {
    this.disableMonitoring();
  }
}
