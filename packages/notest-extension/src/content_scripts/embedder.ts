/**
 *  Content script are loaded into another context than the page, so if we use the HttpMonitor here directly
 *  we are NOT monitoring the page context, but the page extension context.
 *
 *  We need to add a script on the page (that will be
 *  injected into the page context) and then we need to pass messages back to the content script context
 *  of the extension, so to collect them.
 *
 *  Note that if you look at the console, messages from both contexts get printed there,
 *  and you may think that then it is the same context. But it's NOT ;-)
 */

import { isRecording } from './functions/recording.state';
import { sendMessage } from './message.api';
import { NTUser } from '@notest/common';

function addScriptToPage(url: string, id?: string) {
  return new Promise((r) => {
    const scriptElement = document.createElement('script');
    if (id) scriptElement.id = id;
    console.log(chrome.runtime.getURL(url));
    scriptElement.src = chrome.runtime.getURL(url);
    (document.head || document.documentElement).appendChild(scriptElement);
    scriptElement.onload = r;
  });
}

async function addStyleToPage(url: string, element: ShadowRoot | HTMLElement = document.head) {
  return new Promise(async (r) => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('style', 'position:fixed,width:0;height:0;');
    styleElement.setAttribute('type', 'text/css');
    const css = await fetch(chrome.runtime.getURL(url));
    styleElement.textContent = await css.text();
    element.appendChild(styleElement);
    styleElement.onload = r;
  });
}

const injectWidgetCallBack = async () => {
  await addScriptToPage('page/custom-element.js');
  await addStyleToPage('page/widget.css', document.querySelector('notest-widget')!.shadowRoot!);
  await addScriptToPage('page/widget.js');
  const recording = await isRecording();
  if (recording) {
    await addScriptToPage('page/monitor.js');
    postMessage({ type: 'start-monitoring' }, '*');
  }
};

function loadWidgetIfPermitted(user: NTUser) {
  isPermittedToLoad(user).then((isPermitted) => {
    if (isPermitted) injectWidgetCallBack();
  });
}

async function isPermittedToLoad(user: NTUser): Promise<boolean> {
  return (
    !user?.domains?.length ||
    user.domains?.includes(window.location.hostname) ||
    (await isRecording())
  );
}

// (async () => {
//   sendMessage(
//     { type: 'fetch', data: { url: '/user/get-user', method: 'GET' } },
//     undefined,
//     false,
//     async (user: NTUser) => {
//       if (window.document?.body) loadWidgetIfPermitted(user);
//       else window.addEventListener('DOMContentLoaded', async () => loadWidgetIfPermitted(user));
//     }
//   );
// })();

if (window.document?.body) injectWidgetCallBack();
else window.addEventListener('DOMContentLoaded', async () => injectWidgetCallBack());
