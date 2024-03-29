import { DomMonitor, SessionMonitor } from '@notest/session-monitor';
import { BLSessionEvent, eventReference } from '@notest/common';
import { addMessageListener, sendMessage } from '../content_scripts/message.api';

async function sendToExtension(event) {
  sendMessage({ type: 'session-event', data: { ...event, data: document.title } });
}

let sessionMonitor = new SessionMonitor(sendToExtension);

addMessageListener((event) => {
  if (event.type == 'start-monitoring') {
    sessionMonitor.enable();
    getScreenshotFromFullDom();
    addMessageListener((event) => {
      if (event.type == 'stop-recording' || event.type == 'cancel-recording') {
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
  addEventListener('load', () => setTimeout(sendShot, 2000), { once: true });
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
  const data = { fullDom, reference };
  sendMessage({ type: 'take-screenshot', data });
};
