import { disableRecordingIcon, enableRecordingIcon } from './ui/recording-icon';
import {
  BLEvent,
  BLHTTPResponseEvent,
  BLSessionEvent,
  isSocketOpen,
  JsonCompressor,
  NTSession
} from '@notest/common';
import { getCurrentTab } from './functions/current-tab.util';
import { isRecording, setRecording } from '../content_scripts/functions/recording.state';
import { uploadEvents } from './functions/upload.api';
import {
  enableHeadersListeners,
  mergeEventReq,
  populateSocketSendHeaders
} from './functions/headers.util';
import { cleanDomainCookies, getCookiesFromDomain } from './functions/cookies.util';
import {
  addMessageListener,
  NTMessage,
  NTMessageType,
  sendMessage
} from '../content_scripts/message.api';
import { http } from './services/http.service';
import { environment } from '../environments/environment';

let cookieDetailsEvent: any = {};
let events: BLEvent[] = [];

(async () => {
  let sid = await chrome.storage.local.get('sid');
  if (!sid['sid']) {
    await chrome.storage.local.set({ sid: new Date().getTime() });
  }
})();

const executeByMessageType: {
  [k in NTMessageType]?: (request?, sendResponse?: () => any) => Promise<void>;
} = {
  'save-session': saveSession,
  'stop-recording': stopSession,
  'start-recording': startSession,
  'cancel-recording': cancelSession,
  'session-event': pushEvent,
  fetch: doFetch,
  'take-screenshot': takeScreenshot
};

chrome.commands.onCommand.addListener(async function (command) {
  if (command == 'toggle-recording') {
    if (!(await isRecording())) {
      const tab = await getCurrentTab();
      sendMessage({ type: 'start-recording-from-extension' }, tab.id);
    }
  }
});

addMessageListener(async (message: NTMessage, sendResponse) => {
  const functionToCall = executeByMessageType[message.type];
  if (functionToCall) await functionToCall(message, sendResponse);
});

setRecording(false);

async function cancelSession() {
  disableRecordingIcon();
  await setRecording(false);
  events = [];
  console.log('Recording Session Canceled');
}

async function stopSession() {
  mergeEventReq(events as BLHTTPResponseEvent[]);
  populateSocketSendHeaders((events as BLSessionEvent[]).filter(isSocketOpen));
  disableRecordingIcon();
  await setRecording(false);
  console.log('Recording Session Terminated');
}

async function startSession(request: { data: { 'clean-session': boolean } }) {
  events = [];
  let tabId = (await getCurrentTab()).id;
  if (tabId) {
    await setRecording(true);
    if (request.data['clean-session']) await cleanDomainCookies(tabId);
    await chrome.tabs.reload(tabId);
    enableRecordingIcon();
    enableHeadersListeners();
    console.log('Recording Session Started');
  }
}

async function saveSession(request: { data: NTSession['info'] }) {
  const tab = await getCurrentTab();
  if (!tab) {
    console.log('No tab found');
    return;
  }
  await uploadEvents(tab.url!, events, request.data);
  events = [];
}

async function doFetch(
  message: { data: { url: string; options: RequestInit; body: any; method: 'POST' | 'GET' } },
  sendResponse?: (res) => any
) {
  if (message.data.method == 'GET')
    http.get(message.data.url).then(async (res) => {
      sendResponse!(res);
    });
  else if (message.data.method == 'POST') {
    http.post(message.data.url, message.data.body).then(async (res) => sendResponse!(res));
  }
}

async function pushEvent(request) {
  const sid = (await chrome.storage.local.get('sid'))['sid'];
  const { type, ...r } = request;
  const tab = await getCurrentTab();
  const url = tab?.url ?? '';
  events.push({ ...r, timestamp: Date.now(), url, sid, tab: tab.id });

  if (r.name == 'referrer') {
    cookieDetailsEvent = await getCookiesFromDomain(url);
    events.push({ ...cookieDetailsEvent, timestamp: Date.now(), url, sid, tab: tab.id });
  }
}

export function fromBase64ToBlob(base64: string): Blob {
  if (base64.includes('base64,')) base64 = base64.split('base64,')[1];

  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));

  return new Blob([bytes], { type: 'image/jpeg' });
}

export function saveScreenshot(image: string, reference: string) {
  const blob = fromBase64ToBlob(image);
  console.log('uploadScreenshot', image, reference);
  const formData = new FormData();
  formData.append('reference', reference);
  formData.append('name', 'final');
  formData.append('timestamp', '' + new Date().getTime());
  formData.append('file', blob);
  http.post('/media/screenshot-upload', formData);
}

async function takeScreenshot(
  message: { data: { reference: string } },
  sendResponse?: (res) => any
) {
  chrome.tabs.captureVisibleTab({ format: 'jpeg', quality: 50 }, (dataUrl) => {
    saveScreenshot(dataUrl, message.data.reference);
    sendResponse!({ reference: message.data.reference, img: dataUrl });
  });
}
