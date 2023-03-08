import { RequestAnimationFrameTimer } from '@notest/common';

export class DomFrameMutationsMonitor {
  private timer: RequestAnimationFrameTimer;
  private mo: MutationObserver;

  constructor(private callback: (mutations: (MutationRecord & { timestamp: number })[]) => void) {
    let frameMutations: any[] = [];
    this.timer = new RequestAnimationFrameTimer();
    this.timer.start((_) => {
      if (frameMutations.length > 0) {
        this.callback([...frameMutations]);
        frameMutations = [];
      }
    });
    this.mo = new MutationObserver((mutations: MutationRecord[]) => {
      mutations.forEach((m) => {
        (m as any).timestamp = new Date().getTime();
      });
      frameMutations.push(...mutations);
    });
  }

  observe(n: Node) {
    this.mo.observe(n, {
      attributes: true,
      attributeOldValue: true, // to keep track of style attribute
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true
    });
  }

  disable() {
    try {
      this.mo.disconnect();
      this.timer.stop();
    } catch (e) {
      console.log('Probably the observer was not started using observe()', e);
    }
  }
}
