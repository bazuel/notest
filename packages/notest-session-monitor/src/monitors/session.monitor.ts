import { MouseMonitor } from './mouse.monitor';
import { CookieMonitor } from './cookie.monitor';
import { InputMonitor } from './input.monitor';
import { InputValueMonitor } from './input-value.monitor';
import { KeyboardMonitor } from './keyboard.monitor';
import { PageMonitor } from './page.monitor';
import { ScrollMonitor } from './scroll.monitor';
import { StorageMonitor } from './storage.monitor';
import { WindowResizeMonitor } from './window-resize.monitor';
import { blevent } from '../model/dispatched.events';
import { ElementSelectorFinder } from '../utils/selector-finder.util';
import { HttpMonitor } from './http.monitor';
import { getElementAttributes, getElementRect } from '../utils/serialize-target';
import { DomMonitor } from '../dom/dom.monitor';
import { CssMonitor } from '../dom/css.monitor';
import { MediaMonitor } from '../dom/media.monitor';
import { ForceWebComponentsSerializationPatch } from '../dom/force-web-components-serialization.patch';
import { BLEvent, BLEventWithTarget, BLSessionEvent } from '@notest/common';
import { WheelMonitor } from './wheel.monitor';
import { SocketMonitor } from './socket.monitor';

function targetToSelectors(e: BLEventWithTarget) {
  const selector = (e) => {
    try {
      return new ElementSelectorFinder().findUniqueSelector(e);
    } catch {
      return '';
    }
  };

  // used only for document element (scroll event)
  const targetSelector = e.target ? selector(e.target) : ''; //it's a selector. a string
  const currentTargetSelector = e.currentTarget ? selector(e.currentTarget) : ''; //it's a selector. a string
  const { target, currentTarget, ...evt } = e as any; // removes target and currentTarget from the event since we have
  return { ...evt, targetSelector, currentTargetSelector };
}

new ForceWebComponentsSerializationPatch().apply();

export class SessionMonitor {
  sendTo: (event: BLSessionEvent | BLEvent) => void;
  monitors = [
    new MouseMonitor(),
    new WheelMonitor(),
    new CookieMonitor(),
    new InputMonitor(),
    new InputValueMonitor(),
    new KeyboardMonitor(),
    new PageMonitor(),
    new ScrollMonitor(),
    new StorageMonitor(),
    new WindowResizeMonitor(),
    new SocketMonitor()
  ];
  delayedMonitors = [new DomMonitor(), new CssMonitor(), new MediaMonitor()];
  httpMonitor = new HttpMonitor();

  constructor(sendTo: (event: BLEvent | BLSessionEvent) => void) {
    this.sendTo = sendTo;
    this.setupDispatchers();
  }

  enable() {
    this.httpMonitor.enable();
    this.monitors.forEach((m) => m.enable());
    setTimeout(() => {
      this.delayedMonitors.forEach((m) => m.enable());
    }, 1000);
  }

  disable() {
    this.httpMonitor.disable();
    this.monitors.forEach((m) => m.disable());
    this.delayedMonitors.forEach((m) => m.disable());
  }

  private setupDispatchers() {
    const sendEventWithTargetToExtension = (event) => this.sendTo(targetToSelectors(event));
    const sendEventWithSerializedTargetToExtension = async (event) => {
      const rect = await getElementRect(event.target);
      const attributes = getElementAttributes(event.target);
      const { target, currentTarget, ...evt } = event as any;
      this.sendTo({
        ...evt,
        target: {
          rect,
          attributes,
          tag: event.target.tagName,
          innerText: event.target.innerText ?? ''
        }
      });
    };

    Object.keys(blevent.mouse).forEach((me) => {
      if (me != 'scroll') blevent.mouse[me].on(sendEventWithSerializedTargetToExtension);
      else blevent.mouse[me].on(sendEventWithTargetToExtension);
    });

    blevent.media.play.on(sendEventWithSerializedTargetToExtension);
    blevent.media.pause.on(sendEventWithSerializedTargetToExtension);

    blevent.dom.change.on(this.sendTo);
    blevent.dom.full.on(this.sendTo);
    blevent.dom.css_add.on(sendEventWithSerializedTargetToExtension);
    blevent.dom.css_remove.on(sendEventWithSerializedTargetToExtension);

    blevent.cookie.data.on(this.sendTo);

    Object.keys(blevent.keyboard).forEach((ke) => {
      blevent.keyboard[ke].on(sendEventWithSerializedTargetToExtension);
    });

    Object.keys(blevent.page).forEach((me) => blevent.page[me].on(this.sendTo));
    Object.keys(blevent.window).forEach((me) => blevent.window[me].on(this.sendTo));
    Object.keys(blevent.storage).forEach((me) => blevent.storage[me].on(this.sendTo));

    Object.keys(blevent.socket).forEach((me) => blevent.socket[me].on(this.sendTo));

    const httpData = (e) => {
      const headers = e.request.headers;
      const method = e.request.method;
      const path = e.request.path;
      const timestamp = e.request.timestamp;
      const url = e.request.url;
      const body = e.request.body;
      const request = { headers, method, path, timestamp, url, body };
      return {
        name: e.name,
        type: e.type,
        timestamp: e.timestamp,
        request,
        status: e.target?.status
      };
    };

    const errorHandler = (e) => {
      this.sendTo(httpData(e));
    };

    blevent.http.error.on(errorHandler);
    blevent.http.abort.on(errorHandler);
    blevent.http.after_response.on((e) => {
      let event = httpData(e);
      let response = {
        body: e.body,
        headers: e.headers,
        status: e.status,
        timestamp: e.timestamp
      };
      this.sendTo({ ...event, response });
    });
  }
}
