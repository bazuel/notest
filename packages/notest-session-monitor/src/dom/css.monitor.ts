import { observeMethod } from '../utils/method.observer';
import { BLMonitor } from '@notest/common';
import { blevent } from '../model/dispatched.events';

export class CssMonitor implements BLMonitor {
  private insertOriginal!: () => void;
  private removeOriginal!: () => void;

  enable(): void {
    this.insertOriginal = observeMethod(
      CSSStyleSheet.prototype,
      'insertRule',
      function (this, rule: string, index?: number) {
        blevent.dom.css_add({ rule, target: this.ownerNode, index });
      }
    );

    this.removeOriginal = observeMethod(
      CSSStyleSheet.prototype,
      'deleteRule',
      function (this, index: number) {
        blevent.dom.css_remove({ target: this.ownerNode, index });
      }
    );
  }

  disable(): void {
    this.insertOriginal();
    this.removeOriginal();
  }
}
