import { SessionExecutor } from '../session-executor/session-executor';
import { addPositionSelector } from './functions/add-position-selector';
import { findEventsByName } from '../shared/functions/find-events-by-name';
import {
  BLCookieDetailsEvent,
  BLMoveEvent,
  BLPageReferrerEvent,
  BLSessionEvent,
  BLStorageEvent,
  BLWindowResizeEvent,
  NTRunnerConfig
} from '@notest/common';
import { Browser, BrowserContext, BrowserContextOptions, chromium, Page, Video } from 'playwright';
import { MockService } from './services/mock.service';
import { actionWhitelist, runAction, screenshotWhitelist } from './statement-runner';
import { setupMonitor } from './functions/monitor';
import * as fs from 'fs';
import { injectCookie } from './functions/context-functions';
import { serializeStorages } from './functions/storage-serializer';

export class SessionRunner extends SessionExecutor {
  useragent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36';
  viewport: { width: number; height: number };
  private context: BrowserContext;
  browser: Browser;
  mockService: MockService;
  private page: Page;
  private testFailed = false;
  private screenshotList: { name: string; data: Buffer; fired: Date }[] = [];
  configuration: NTRunnerConfig;
  private lastEvent?: BLSessionEvent;
  private monitorScript: string;
  private video: Video | null;
  private eventsCollected: BLSessionEvent[];
  private startVideoTimeStamp: Date = null;

  constructor() {
    super();
    this.monitorScript = fs.readFileSync(process.cwd() + '/scripts/index.monitor.js', 'utf8');
  }

  async init(config: NTRunnerConfig, session: BLSessionEvent[]) {
    console.log('Init configuration');
    this.eventsCollected = [];
    this.lastEvent = undefined;
    this.configuration = config;
    await addPositionSelector();
    this.viewport = findEventsByName<BLWindowResizeEvent>(session, 'resize');
    await this.setup(session);
  }

  private async setup(session: BLSessionEvent[]) {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.createBrowserContext(this.browser);
    if (this.configuration.recordVideo) await this.addMouseHtmlElement();
    if (this.configuration.backendType == 'mock') {
      this.mockService = new MockService(this.context, session);
      await this.mockService.setupMock();
    }
    if (this.configuration.monitoring) {
      await setupMonitor(this.context, this.eventsCollected, this.monitorScript);
    }
    if (this.configuration.loginEvent) {
      console.log('LOGIN EVENTS FOUNDED: \n');
      console.log(this.configuration.loginEvent);
      await this.setInitStorage(this.configuration.loginEvent);
      await injectCookie(this.context, this.configuration.loginEvent);
    } else {
      await this.setInitStorage(session);
    }
    this.page = await this.context.newPage();
    if (this.configuration.recordVideo) {
      this.video = this.page.video();
    }
    this.startVideoTimeStamp = new Date();
    const referrerAction = findEventsByName<BLPageReferrerEvent>(session, 'referrer');
    const referrerURL = referrerAction.url.replace(
      new URL(referrerAction.url).origin,
      this.configuration.sessionDomain ?? new URL(referrerAction.url).origin
    );
    await this.page.goto(referrerURL);
    console.log(`setup phase, page: ${await this.page.title()}`);
  }

  async executeEvent(index: number, session: BLSessionEvent[], event: BLSessionEvent) {
    if (
      screenshotWhitelist.includes(event.name) &&
      this.isNewDomLoaded(session, index) &&
      this.configuration.takeScreenshot
    ) {
      console.log(`Execute Phase: taking screenshot, page: ${await this.page.title()}`);
      const image = await this.page.screenshot();
      this.screenshotList.push({
        name: `${event.name}_${event.timestamp}`,
        data: image,
        fired: new Date()
      });
    }
    if (actionWhitelist[this.configuration.backendType].includes(event.name)) {
      let timeout = this.lastEvent ? event.timestamp - this.lastEvent.timestamp : 0;
      if (timeout < 5) timeout = 200;
      await this.page.waitForTimeout(timeout);
      this.lastEvent = event;
      if (this.configuration.backendType == 'mock')
        this.mockService.actualTimestamp = event.timestamp;
      if (runAction[event.name]) {
        console.log(event.name);
        await runAction[event.name]!(this.page, event).catch((e) => {
          this.testFailed = true;
          console.log(e);
          throw new Error(JSON.stringify(this.lastEvent));
        });
        if (event.name == 'mousemove' && this.configuration.recordVideo)
          this.renderMouse(event as unknown as BLMoveEvent);
      }
    }
  }

  async end() {
    if (this.configuration.takeScreenshot) {
      const image = await this.page.screenshot();
      this.screenshotList.push({ name: 'final', data: image, fired: new Date() });
    }
    if (this.configuration.monitoring) {
      await this.page.evaluate(() => window.nt_monitorInstance.disable());
    }
    if (this.configuration.login) {
      const { cookies, origins } = await this.context.storageState();
      const sessionStorage: Storage = await this.page.evaluate(() => window.sessionStorage);
      const url = this.page.url();
      const cookieEvent = {
        name: 'cookie-details',
        type: 'cookie',
        details: cookies
      } as unknown as BLCookieDetailsEvent;
      const sessionStorageEvent: BLStorageEvent = {
        storage: sessionStorage,
        name: 'session-full',
        timestamp: new Date().getTime()
      };
      const localStorageEvent: BLStorageEvent = {
        storage: serializeStorages(origins),
        name: 'local-full',
        timestamp: new Date().getTime()
      };
      this.eventsCollected.push({
        ...sessionStorageEvent,
        timestamp: Date.now(),
        sid: 0,
        tab: 0,
        url: url
      });
      this.eventsCollected.push({
        ...localStorageEvent,
        timestamp: Date.now(),
        sid: 0,
        tab: 0,
        url: url
      });
      this.eventsCollected.push({
        ...cookieEvent,
        timestamp: Date.now(),
        sid: 0,
        tab: 0,
        url: url
      });
    }
    await this.page.close();
    await this.context.close();
    await this.browser.close();
    return {
      screenshotList: this.screenshotList,
      events: this.eventsCollected,
      testFailed: this.testFailed,
      lastEvent: this.lastEvent,
      startVideoTimeStamp: this.startVideoTimeStamp,
      videoPath: await this.video?.path()
    };
  }

  private async setInitStorage(session: BLSessionEvent[]) {
    const storage = { localStorage: {}, sessionStorage: {} };
    const localStorageAction = findEventsByName<BLStorageEvent>(session, 'local-full');
    const sessionStorageAction = findEventsByName<BLStorageEvent>(session, 'session-full');

    if (localStorageAction) storage.localStorage = localStorageAction.storage;
    if (sessionStorageAction) storage.sessionStorage = sessionStorageAction.storage;
    await this.context.addInitScript(async (storage) => {
      for (const key in storage.localStorage) localStorage.setItem(key, storage.localStorage[key]);
      for (const key in storage.sessionStorage)
        sessionStorage.setItem(key, storage.sessionStorage[key]);
    }, storage);
  }

  private isNewDomLoaded(session: BLSessionEvent[], index: number) {
    for (let i = index - 1; i > 0; i--) {
      if (session[i].name == 'dom-change' || session[i].name == 'dom-full') return true;
      if (session[i].name == 'after-response') return false;
    }
    return false;
  }

  private async addMouseHtmlElement() {
    await this.context.addInitScript(() => {
      const div = document.createElement('div');
      div.id = '--nt-mouse';
      div.style.position = 'fixed';
      div.style.height = '7px';
      div.style.zIndex = '10002';
      div.style.width = '7px';
      div.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12.849 24l-3.96-7.853-4.889 4.142v-20.289l16 12.875-6.192 1.038 3.901 7.696-4.86 2.391zm-3.299-10.979l4.194 8.3 1.264-.617-4.213-8.313 4.632-.749-9.427-7.559v11.984l3.55-3.046z'/></svg>`;
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(div));
    });
  }

  private async renderMouse(event: BLMoveEvent) {
    this.page.evaluate((e) => {
      const element = document.getElementById('--nt-mouse');
      if (element) {
        element.style.top = e.y + 1 + 'px';
        element.style.left = e.x + 1 + 'px';
      }
    }, event);
  }

  private async createBrowserContext(browser: Browser) {
    const options: BrowserContextOptions = { viewport: this.viewport, userAgent: this.useragent };
    if (this.configuration.recordVideo)
      options.recordVideo = {
        size: {
          width: Math.trunc((this.viewport.width * 2) / 3),
          height: Math.trunc((this.viewport.height * 2) / 3)
        },
        dir: process.cwd() + '/video'
      };
    return await browser.newContext(options);
  }
}
