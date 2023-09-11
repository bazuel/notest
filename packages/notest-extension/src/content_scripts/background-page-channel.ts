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
    console.log('event', e);
    sendMessage({ ...e, type: message.type, data: document.title });
  } else if (message.type && message.type == 'fetch') {
    const responseCallback = (response) => {
      response.id = message.data.id;
      sendMessage({ type: 'fetch-response', data: response }, undefined, true);
    };
    sendMessage(message, undefined, undefined, responseCallback);
  } else if (message.type && message.type == 'take-screenshot') {
    const responseCallback = (response) => {
      sendMessage({ type: 'screenshot-saved', data: response }, undefined, true);
    };
    sendMessage(message, undefined, undefined, responseCallback);
  }
}

function callbackFromBackgroundToPage(request: NTMessage) {
  if (request.type == 'start-recording-from-extension') {
    sendMessage(request, undefined, true);
  }
}
