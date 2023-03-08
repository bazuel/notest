import { DomMonitor, SessionMonitor } from '@notest/session-monitor';
import { environment } from '../environments/environment';
import { getCurrentTab } from '../chrome/functions/current-tab.util';
import {BLDomEvent, BLSessionEvent, eventReference} from '@notest/common';

async function sendToExtension(event) {
  window.postMessage({ type: 'session-event', data: { ...event, data: document.title } }, '*');
}

let sessionMonitor = new SessionMonitor(sendToExtension);
sessionMonitor.enable();

export function takeFullDomShot() {
  const domMonitor = sessionMonitor.delayedMonitors[0] as DomMonitor;
  return domMonitor.takeDomScreenshot();
}

setTimeout(async () => {
  const fullDom = takeFullDomShot();
  const domSessionEvent : BLSessionEvent = {name: 'dom-full', type:"dom",sid:0, tab:0, full: fullDom, timestamp: Date.now(), url: window.location.href}
  const reference = eventReference(domSessionEvent);
  window.postMessage({ type: 'reference', data: reference }, '*');
  const body = { fullDom, reference };
  fetch(`${environment.api}/api/session/shot`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}, 1000);

window.addEventListener('message', function (event) {
  if (event.data.type == 'stop-recording' || event.data.type == 'cancel-recording')
    sessionMonitor.disable();
});
