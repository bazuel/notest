import { SessionMonitor } from '@notest/session-monitor';
import { BLEvent } from '@notest/common';
import { session } from './session.service';

export class MonitorHandler {
  monitor!: SessionMonitor;

  running = false;

  constructor() {
    this.monitor = new SessionMonitor((event) => this.collectEvent(event));
  }

  start() {
    this.monitor.enable();
    session.path = window.location.pathname;
    this.running = true;
    session.fullDomShot();
  }

  async stop() {
    this.monitor.disable();
    this.running = false;
    session.save();
  }

  cancel() {
    this.monitor.disable();
    this.running = false;
    session.reset();
  }

  async collectEvent(event: BLEvent) {
    session.addEvent(event);
  }
}

export const monitor = new MonitorHandler();
