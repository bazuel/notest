import { BrowserContext } from 'playwright';
import { BLCookieDetailsEvent, BLEvent, BLSessionEvent } from '@notest/common';

declare global {
  interface Window {
    controlMock: () => Promise<{ date: boolean; storage: boolean }>;
    setMockDateTrue: () => void;
    setMockStorageTrue: () => void;
    getActualMockedTimestamp: () => Promise<number>;
  }
}

export class MockService {
  private context: BrowserContext;
  private mockedState: { date: boolean; storage: boolean };
  private _actualTimestamp: number;
  private mockData: {
    cookies?: string;
    localStorage?: { [k: string]: string };
    sessionStorage?: { [k: string]: string };
  };
  private session: BLSessionEvent[];

  constructor(context: BrowserContext, jsonEvents: BLSessionEvent[]) {
    this.session = jsonEvents;
    this.context = context;
    this.mockedState = { date: false, storage: false };
    this.mockData = {};
  }

  async setupMock() {
    await this.setupMockCookie(this.session);
    this.actualTimestamp = this.session[0].timestamp;
    await this.exposeFunctions();
    await this.mockDate();
    await this.mockRoutes(this.session);
  }

  async mockDate() {
    // Update the Date accordingly in your test pages
    await this.context.addInitScript(`{
        // Extend Date constructor to default to fakeNow
         (async() => {
              let fakeNow = await window.getActualMockedTimestamp()
              Date = class extends Date {
                constructor(...args) {
                  if (args.length === 0) {
                    super(fakeNow);
                  } else {
                    super(...args);
                  }
                }
              }
              // Override Date.now() to start from fakeNow
              const __DateNowOffset = fakeNow - Date.now();
              const __DateNow = Date.now;
              Date.now = () => __DateNow() + __DateNowOffset;
              await window.setMockDateTrue()
         })()
      }`);
  }

  async mockRoutes(jsonEvents: BLEvent[]) {
    let key;
    let responses = jsonEvents.filter((event) => event.name == 'after-response') as any;
    let requestMap: { [k: string]: any[] } = {};
    for (const { request, response } of responses) {
      key = `${request.method}.${request.url}`;
      if (!requestMap[key]) requestMap[key] = [];
      requestMap[key].push(response);
    }
    await this.context.route('*/**', async (route, request) => {
      if (
        (request.resourceType() == 'xhr' || request.resourceType() == 'fetch') &&
        requestMap[`${request.method()}.${request.url()}`] &&
        requestMap[`${request.method()}.${request.url()}`].length
      ) {
        let response = requestMap[`${request.method()}.${request.url()}`].shift();
        let headers = {};
        Object.keys(response.headers).forEach((h) => (headers[h] = response.headers[h]));
        await route.fulfill({
          headers: headers,
          body: response.body as string,
          status: response.status
        });
      } else {
        await route.continue();
      }
    });
  }

  async exposeFunctions() {
    await this.context.exposeFunction('controlMock', () => this.mockedState);
    await this.context.exposeFunction('getActualMockedTimestamp', () => this._actualTimestamp);
    await this.context.exposeFunction('setMockDateTrue', () => (this.mockedState.date = true));
    await this.context.exposeFunction(
      'setMockStorageTrue',
      () => (this.mockedState.storage = true)
    );
  }

  set actualTimestamp(value: number) {
    this._actualTimestamp = value;
  }

  async setupMockCookie(jsonEvents: BLEvent[]) {
    let cookieAction = jsonEvents.find((ev) => ev.name == 'cookie-details') as BLCookieDetailsEvent;
    if (cookieAction) {
      cookieAction.details = cookieAction.details.map((detail) => {
        return { name: detail.name, value: detail.value, path: detail.path, domain: detail.domain };
      });
      await this.context.addCookies(cookieAction.details);
    }
  }
}
