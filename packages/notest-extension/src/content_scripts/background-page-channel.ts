import { BLEvent } from '@notest/common';
import { addMessageListener, NTMessage, sendMessage } from './message.api';

function openCommunicationChannel() {
  //channel to communicate with page context (popup/background => page)
  addMessageListener(callbackFromBackgroundToPage);

  //channel to the extension (page => popup/background)
  addMessageListener(callbackFromPageToBackground, true);
}

openCommunicationChannel();

function callbackFromPageToBackground(message: NTMessage) {
  console.log('event from page', message);
  if (
    message.type &&
    [
      'start-recording',
      'stop-recording',
      'cancel-recording',
      'login',
      'logout',
      'save-session'
    ].includes(message.type)
  ) {
    sendMessage(message);
  } else if (message.type && ['session-event', 'screenshot-event'].includes(message.type)) {
    const e: BLEvent = message.data;
    sendMessage({ ...e, type: message.type, data: document.title });
  } else if (message.type && message.type == 'fetch') {
    sendMessage(message)!.then((response) => {
      if (response) postMessage({ type: 'fetch-response', data: response }, '*');
    });
  }
}

function callbackFromBackgroundToPage(request: NTMessage) {
  if (request.type == 'start-recording-from-extension') {
    sendMessage(request, undefined, true);
  }
}
