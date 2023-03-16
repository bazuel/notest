import { disableRecordingIcon, enableRecordingIcon } from './ui/recording-icon';
import { BLEvent, BLHTTPResponseEvent, NTSession } from '@notest/common';
import { getCurrentTab } from './functions/current-tab.util';
import { isRecording, setRecording } from '../content_scripts/functions/recording.state';
import { uploadEvents } from './functions/upload.api';
import { enableHeadersListeners, mergeEventReq } from './functions/headers.util';
import { getCookiesFromDomain } from './functions/cookies.util';
import { environment } from '../environments/environment';
import { addMessageListener, NTMessageType, sendMessage } from '../content_scripts/message.api';

let cookieDetailsEvent: any = {};
let events: BLEvent[] = [];

(async () => {
  let sid = await chrome.storage.local.get('sid');
  if (!sid['sid']) {
    await chrome.storage.local.set({ sid: new Date().getTime() });
  }
})();

chrome.commands.onCommand.addListener(async function (command) {
  if (command == 'toggle-recording') {
    if (!(await isRecording())) {
      const tab = await getCurrentTab();
      sendMessage({ type: 'start-recording-from-extension' }, tab.id);
    }
  }
});

addMessageListener(async (message: { type: NTMessageType }) => {
  const functionToCall = executeByMessageType[message.type];
  if (functionToCall) await functionToCall(message);
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
  disableRecordingIcon();
  await setRecording(false);
  console.log('Recording Session Terminated');
}

async function startSession() {
  events = [];
  let tabId = (await getCurrentTab()).id;
  if (tabId) {
    await setRecording(true);
    await chrome.tabs.reload(tabId);
    enableRecordingIcon();
    enableHeadersListeners();
    console.log('Recording Session Started');
    sendMessage({ type: 'take-screenshot' }, tabId);
  }
}

async function saveSession(request: { data: { data: NTSession['info'] } }) {
  const tab = await getCurrentTab();
  if (!tab) {
    console.log('No tab found');
    return;
  }
  delete request.data.data.targetList;
  await uploadEvents(tab.url!, events, request.data.data);
  events = [];
}

async function doFetch(
  message: { data: { url: string; options: RequestInit; body: any; method: 'POST' | 'GET' } },
  sendResponse?: (res) => any
) {
  console.log('fetching: ', message.data.url, message.data.options, message.data.body);
  fetch(`${environment.api}${message.data.url}`, {
    method: message.data.method,
    body: JSON.stringify(message.data.body),
    headers: { 'Content-Type': 'application/json' }
  }).then(async (res) => {
    sendResponse!(await res.json());
  });
}

const executeByMessageType: {
  [k in NTMessageName]: (request?, sendResponse?: () => any) => Promise<void>;
} = {
  'save-session': saveSession,
  'stop-recording': stopSession,
  'start-recording': startSession,
  'cancel-recording': cancelSession,
  'session-event': pushEvent,
  fetch: doFetch
};

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

type NTMessageName =
  | 'stop-recording'
  | 'start-recording'
  | 'cancel-recording'
  | 'save-session'
  | 'session-event'
  | 'fetch';
