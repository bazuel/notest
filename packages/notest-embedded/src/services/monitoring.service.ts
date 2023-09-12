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
    this.running = true;
  }

  async stop() {
    this.monitor.disable();
    this.running = false;
    return await session.saveEvents();
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
