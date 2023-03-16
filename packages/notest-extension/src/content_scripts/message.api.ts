/**
 *  To communicate with page context we use
 *    - window.addEventListener( 'message', ... to receive messages
 *    - window.postMessage(...., '*'); to send messages
 *
 *  To communicate with extension context we use
 *    - chrome.runtime.onMessage.addEventListener(callBack) to receive messages
 *    - chrome.runtime.sendMessage to receive messages(message,...) to send messages
 *
 *  Note that messages from other sources may arrive, so assure we get messages from trusted sources
 *  when sending private data
 */

export function sendMessage(message: NTMessage, tabId?: number, forceWindowMessage?: boolean) {
  if (forceWindowMessage) return sendWindowMessage(message);
  if (tabId) return sendChromeMessageToTab(tabId, message);
  if (chrome.runtime) return sendChromeMessage(message);
  return sendWindowMessage(message);
}

export function addMessageListener(
  callback: <T extends NTMessage>(message: T) => void,
  forceWindowMessage?: boolean
) {
  if (forceWindowMessage || !chrome.runtime) addWindowMessageListener(callback);
  else addChromeMessageListener(callback);
}

function addChromeMessageListener(callback: (message: NTMessage) => any | Promise<any>) {
  chrome.runtime.onMessage.addListener(callback);
}

function addWindowMessageListener(callback) {
  window.addEventListener('message', (ev) => {
    if (ev.source != window) return;
    callback(ev.data);
  });
}

function sendChromeMessage(message: NTMessage) {
  return chrome.runtime.sendMessage(message);
}

function sendChromeMessageToTab(tabId: number, message: NTMessage) {
  return chrome.tabs.sendMessage(tabId, message);
}

function sendWindowMessage(message: NTMessage) {
  window.postMessage(message, '*');
}

export type NTMessageType =
  | 'save-session'
  | 'stop-recording'
  | 'start-recording'
  | 'cancel-recording'
  | 'session-event'
  | 'login'
  | 'logout'
  | 'fetch'
  | 'screenshot-event'
  | 'start-recording-from-extension'
  | 'fetch-response'
  | 'screenshot-saved'
  | 'reference'
  | 'take-screenshot'
  | 'get-storage-response'
  | 'get-storage'
  | 'set-storage'
  | 'start-monitoring';

export interface NTMessage {
  type: NTMessageType;
  data?: any;
}

export interface NTStorageMessage extends NTMessage {
  data?: { key: string; value: string; id: string };
}
