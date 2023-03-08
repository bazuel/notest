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

import { BLEvent } from '@notest/common';

function openCommunicationChannel() {
  //channel to communicate with page context (popup/background => page)
  chrome.runtime.onMessage.addListener(async function (request) {
    if (request.messageType == 'set-reference') {
      window.postMessage({ type: 'reference', data: request.data }, '*');
    }
    if (request.messageType == 'start-recording-from-extension'){
       window.postMessage({type: request.messageType}, '*');
    }
  });

  //channel to the extension (page => popup/background)
  window.addEventListener(
    'message',
    function (event) {
      // We only accept messages from ourselves
      if (event.source != window) return;
      else if (
        event.data.type &&
        [
          'start-recording',
          'stop-recording',
          'cancel-recording',
          'login',
          'logout',
          'save-session'
        ].includes(event.data.type)
      ) {
        chrome.runtime.sendMessage({ messageType: event.data.type, data: event.data });
      } else if (
        event.data.type &&
        ['session-event', 'screenshot-event'].includes(event.data.type)
      ) {
        const e: BLEvent = event.data.data;
        console.log('collecting event', e);
        chrome.runtime.sendMessage(
          { ...e, messageType: event.data.type, data: document.title },
          (response) => {
            if (response) console.log(response);
          }
        );
      }
    },
    false
  );
}

openCommunicationChannel();
