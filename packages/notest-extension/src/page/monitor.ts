import { DomMonitor, SessionMonitor } from '@notest/session-monitor';
import { BLSessionEvent, eventReference } from '@notest/common';
import { environment } from '../environments/environment';

async function sendToExtension(event) {
  window.postMessage({ type: 'session-event', data: { ...event, data: document.title } }, '*');
}

let sessionMonitor = new SessionMonitor(sendToExtension);

addEventListener('message', function (event) {
  if (event.data.type == 'start-monitoring') {
    sessionMonitor.enable();
    getScreenshotFromFullDom();
    addEventListener('message', function (event) {
      if (event.data.type == 'stop-recording' || event.data.type == 'cancel-recording') {
        sessionMonitor.disable();
      }
    });
  }
});

export function takeFullDomShot() {
  const domMonitor = sessionMonitor.delayedMonitors[0] as DomMonitor;
  return domMonitor.takeDomScreenshot();
}

function getScreenshotFromFullDom() {
  addEventListener('DOMContentLoaded', () => sendShot(), { once: true });
}

const sendShot = async () => {
  const fullDom = takeFullDomShot();
  const domSessionEvent: BLSessionEvent = {
    name: 'dom-full',
    type: 'dom',
    sid: 0,
    tab: 0,
    full: fullDom,
    timestamp: Date.now(),
    url: window.location.href
  };
  const reference = eventReference(domSessionEvent);
  window.postMessage({ type: 'reference', data: reference }, '*');
  const body = { fullDom, reference };
  fetch(`${environment.api}/api/session/shot`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((res) => {
    setTimeout(() => {
      window.postMessage({ type: 'screenshot-saved' }, '*');
    }, 5000);
  });
};
