import { BLMonitor } from '@notest/common';
import { RequestAnimationFrameTimer } from '@notest/common';
import { blevent } from '../model/dispatched.events';
import { on } from '../utils/on.event';

export class InputMonitor implements BLMonitor {
  private disableMonitoring: () => void = () => {};

  enable(): void {
    const inputs = new Map();
    const checked = new Map();
    let raf = new RequestAnimationFrameTimer();
    raf.start((ms) => {
      inputs.forEach((e) => {
        blevent.keyboard.input(e);
      });
      inputs.clear();
      checked.forEach((e) => {
        blevent.keyboard.checked(e);
      });
      checked.clear();
    });

    const eventHandler = (event: Event) => {
      const { target } = event;
      const { type, name } = target as HTMLInputElement;

      if (type === 'checkbox') {
        blevent.keyboard.checked({
          target: target ?? undefined,
          checked: (target as HTMLInputElement)?.checked
        });
      } else if (type === 'radio') {
        if (name)
          document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
            if (el && el !== target) {
              checked.set(el, {
                target: el,
                checked: (el as HTMLInputElement)?.checked
              });
            }
          });
        if (target)
          checked.set(target, { target: target, checked: (target as HTMLInputElement)?.checked });
      } else {
        let text = (target as HTMLInputElement)?.value; /*
                if (type === 'password') {
                    text = text.replace(/./g, '*');
                }*/
        if (target) inputs.set(target, { target: target, value: text });
      }
    };

    let i = on('input', eventHandler);
    let c = on('change', eventHandler);
    this.disableMonitoring = () => {
      c();
      i();
      raf.stop();
    };
  }

  disable(): void {
    this.disableMonitoring();
  }
}
