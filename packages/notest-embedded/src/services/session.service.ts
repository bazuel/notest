import { BLEvent, BLSessionEvent, eventReference, NTSession } from '@notest/common';
import { uploadEvents, uploadShot } from './upload.function';
import { monitor } from './monitoring.service';
import { DomMonitor } from '@notest/session-monitor';
import { configuration } from './configuration.service';

export class SessionService {
  events: BLEvent[] = [];
  reference!: string;
  path!: string;

  addEvent(event: BLEvent) {
    this.events.push(event);
  }

  reset() {
    this.events = [];
    this.path = '';
  }

  async save() {
    const url = (this.events[0] as BLSessionEvent).url;
    const sessionInfo: NTSession['info'] & { reference: string; userid: string } = {
      backend_type: 'full',
      rerun: false,
      description: '',
      e2eScript: '',
      internal_error: false,
      isLogin: false,
      reference: this.reference,
      session_logged: true,
      targetList: [],
      title: 'Embedded - ' + configuration.configuration.domain + '-' + this.path,
      userid: configuration.configuration.userid
    };
    const res = await uploadEvents(this.events, url, sessionInfo);
    this.reset();
    return res;
  }

  fullDomShot() {
    const fullDom = (monitor.monitor.delayedMonitors[0] as DomMonitor).takeDomScreenshot();
    const domSessionEvent: BLSessionEvent = {
      name: 'dom-full',
      type: 'dom',
      sid: 0,
      tab: 0,
      full: fullDom,
      timestamp: Date.now(),
      url: window.location.href
    };
    this.reference = eventReference(domSessionEvent);
    const data = { fullDom, reference: this.reference };
    uploadShot(data);
  }
}

export const session = new SessionService();
