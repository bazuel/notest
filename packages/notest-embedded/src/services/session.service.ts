import { BLEvent, BLSessionEvent, eventReference, NTSession } from '@notest/common';
import { uploadEvents, uploadShot } from './upload.function';
import { monitor } from './monitoring.service';
import { DomMonitor } from '@notest/session-monitor';

export class SessionService {
  events: BLEvent[] = [];
  reference!: string;

  addEvent(event: BLEvent) {
    this.events.push(event);
    if (this.events.length == 1) {
      this.reference = eventReference(event as BLSessionEvent);
      this.fullDomShot();
    }
  }

  reset() {
    this.events = [];
  }

  async saveEvents() {
    const url = (this.events[0] as BLSessionEvent).url;
    const sessionInfo: NTSession['info'] & { reference: string } = {
      backend_type: 'full',
      description: '',
      e2eScript: '',
      internal_error: false,
      isLogin: false,
      reference: this.reference,
      session_logged: true,
      targetList: [],
      title: 'Embedded - ' + new URL(url).href
    };
    const res = await uploadEvents(this.events, url, sessionInfo);
    this.reset();
    return res;
  }

  fullDomShot() {
    const fullDom = (monitor.monitor.delayedMonitors[0] as DomMonitor).takeDomScreenshot();
    uploadShot(fullDom, this.reference);
  }
}

export const session = new SessionService();
