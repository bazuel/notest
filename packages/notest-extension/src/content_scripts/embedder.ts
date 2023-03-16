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
import { isLoaded } from './functions/embedded-script.state';

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

async function addDivToPage(id: string) {
  return new Promise<HTMLElement>((r) => {
    const div = document.createElement('div');
    div.setAttribute('style', 'all: unset !important;');
    div.id = id;
    document.body.appendChild(div);
    r(div);
  });
}

async function addStyleToPage(url: string, element: HTMLElement = document.head) {
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

(async () => {
  if (!isLoaded('--nt-widget')) {
    window.addEventListener('DOMContentLoaded', async () => {
      const div = await addDivToPage('--nt-widget');
      await addStyleToPage('page/widget.css', div);
      await addScriptToPage('page/widget.js');
    });
  }
  const recording = await isRecording();
  if (recording) {
    await addScriptToPage('page/monitor.js');
    postMessage({ type: 'start-monitoring' }, '*');
  }
})();
