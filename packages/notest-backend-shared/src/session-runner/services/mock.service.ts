import { BrowserContext } from 'playwright';
import { afterResponseFilter, BLCookieDetailsEvent, BLEvent, BLSessionEvent } from '@notest/common';
import fs from 'fs';

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
    // await this.mockSockets();
    await this.mockRoutes(this.session);
  }

  async mockDate() {
    // Update the Date accordingly in your test pages
    await this.context.addInitScript(
      fs.readFileSync(process.cwd() + '/scripts/date.mock.js', 'utf8')
    );
  }

  async mockRoutes(eventList: BLEvent[]) {
    let responses = eventList.filter(afterResponseFilter);

    let requestMap = responses.reduce((obj: { [key: string]: any[] }, { request, response }) => {
      let key = `${request.method}.${request.url}`;
      if (!obj[key]) obj[key] = [];
      obj[key].push(response);
      return obj;
    }, {});

    // let websocketResponses = eventList.filter(isSocketOpen);
    // let websocketMap = websocketResponses.reduce(
    //   (obj: { [key: string]: BLSocketOpenEvent['value'][] }, { value }) => {
    //     let key = value.url;
    //     if (!obj[key]) obj[key] = [];
    //     obj[key].push(value);
    //     return obj;
    //   },
    //   {}
    // );
    // this.mockWebSocketRoutes(websocketMap);

    await this.context.route('*/**', async (route, request) => {
      if (
        (request.resourceType() == 'xhr' || request.resourceType() == 'fetch') &&
        requestMap[`${request.method()}.${request.url()}`] &&
        requestMap[`${request.method()}.${request.url()}`].length
      ) {
        let response = {} as any;
        let responseMap = requestMap[`${request.method()}.${request.url()}`];
        if (responseMap.length > 1) response = responseMap.shift();
        else response = responseMap[0];

        let headers = {};
        Object.keys(response.headers).forEach((h) => (headers[h] = response.headers[h]));
        await route.fulfill({
          headers,
          body: response.body as string,
          status: response.status
        });
      } else if (request.resourceType() == 'websocket') {
        // let response = {} as any;
        // let responseMap = websocketMap[request.url()];
        // if (responseMap.length > 1) response = responseMap.shift();
        // else response = responseMap[0];
        // await route.fulfill({
        //   headers: response.headers,
        //   body: response.body,
        //   status: response.status
        // });
        // ciao1.push(request);
        await route.continue();
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

  private async mockSockets() {
    await this.context.addInitScript(`{(()=>{
    var originalWebSocket = window.WebSocket;

    class CustomWebSocket extends originalWebSocket {
      originalSend
  
      constructor(url, protocols) {
        super(url, protocols);
  
        this.originalSend = this.send;
  
        // Overwrite the \`send\` function to prevent actual sending
        this.send = function (data) {
          console.log('Block sending message', data);
        };
  
        this.addEventListener('message', function (event) {
          console.log('Mocked message from', this.url);
          this.dispatchEvent(new MessageEvent('message', { data: '' }));
        });
  
        this.addEventListener('open', function () {
          console.log('Mocked open from', this.url);
          // this.dispatchEvent(new Event('open'));
        });
  
        this.addEventListener('close', function (event) {
          console.log('Mocked close from', event);
          this.dispatchEvent(new CloseEvent('close'));
        });
  
        this.addEventListener('error', function (event) {
          console.log('error', event);
        });
      }
    }
  
    window.WebSocket = CustomWebSocket;
    }
    )()}`);
  }
}
