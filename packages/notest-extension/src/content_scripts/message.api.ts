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

export function sendMessage(
  message: NTMessage,
  tabId?: number,
  forceWindowMessage?: boolean,
  responseCallback?: (response: any) => void
) {
  if (forceWindowMessage) sendWindowMessage(message);
  else if (tabId) sendChromeMessageToTab(tabId, message);
  else if (chrome.runtime) sendChromeMessage(message, responseCallback);
  else sendWindowMessage(message);
}

export function addMessageListener(
  callback: <T extends NTMessage>(message: T, sendResponse?) => void,
  forceWindowMessage?: boolean
) {
  if (forceWindowMessage || !chrome.runtime) addWindowMessageListener(callback);
  else addChromeMessageListener(callback);
}

function addChromeMessageListener(
  callback: (message: NTMessage, sendResponse: () => any) => any | Promise<any>
) {
  const listener = (message: NTMessage, _, sendResponse: (response?: any) => void) => {
    callback(message, sendResponse);
    return true;
  };
  chrome.runtime.onMessage.addListener(listener);
}

function addWindowMessageListener(callback) {
  addEventListener('message', (ev) => {
    if (ev.source != window) return;
    callback(ev.data);
  });
}

function sendChromeMessage(message: NTMessage, responseCallback?: (response: any) => void) {
  return chrome.runtime.sendMessage(message, responseCallback!);
}

function sendChromeMessageToTab(tabId: number, message: NTMessage) {
  return chrome.tabs.sendMessage(tabId, message);
}

function sendWindowMessage(message: NTMessage) {
  postMessage(message, '*');
}

export type NTMessageType =
  | 'save-session'
  | 'stop-recording'
  | 'stop-recording-response'
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
