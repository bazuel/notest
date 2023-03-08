import {
  BLCookieEvent,
  BLEvent,
  BLEventName,
  BLMouseEvent,
  BLStorageEvent,
  BLWheelEvent,
  BLWindowResizeEvent
} from '@notest/common';
import { Page } from 'playwright';

export const actionWhitelist: { [k: string]: BLEventName[] } = {
  full: [
    'mousedown',
    'mouseup',
    'elementscroll',
    'mousemove',
    'wheel',
    'contextmenu',
    'resize',
    'input'
  ],
  mock: [
    'mousedown',
    'mouseup',
    'elementscroll',
    'mousemove',
    'wheel',
    'contextmenu',
    'resize',
    'input'
  ]
};

export const screenshotWhitelist: BLEventName[] = ['after-response'];

export const runAction: Partial<{
  [k in BLEventName]: (page: Page, a?: BLEvent) => Promise<any>;
}> = {
  mousedown: executeMouseDown,
  mouseup: executeMouseUp,
  mousemove: executeMouseMove,
  wheel: executeScroll,
  contextmenu: executeRightClick,
  resize: executeResize,
  input: executeInput,
  'local-full': setLocalStorage,
  'session-full': setSessionStorage,
  'cookie-data': setCookie
};

export async function executeMouseDown(page: Page) {
  await page.mouse.down();
}

export async function executeMouseUp(page: Page) {
  await page.mouse.up();
}

export async function executeRightClick(page: Page, a: BLMouseEvent) {
  await page.mouse.click(a.x, a.y, { button: 'right' });
}

export async function executeResize(page: Page, event: BLWindowResizeEvent) {
  await page.setViewportSize({ width: event.width, height: event.height });
}

export async function executeInput(page: Page, event) {
  const { x, y, width, height } = event.target.rect;
  const point = { x: x + width / 2, y: y + height / 2 };
  const locator = page.locator(`xy=${point.x},${point.y}`).first();
  const locatorTagName = await locator.evaluate((e) => e.tagName);
  if(locatorTagName.toLowerCase() == 'input' || locatorTagName.toLowerCase() == 'textarea')
    await page.locator(`xy=${point.x},${point.y}`).first().fill(event.value);
}

export async function executeMouseMove(page: Page, a: BLMouseEvent) {
  await page.mouse.move(a.x, a.y);
}

export async function executeScroll(page: Page, event: BLWheelEvent) {
  await page.mouse.wheel(event.deltaX, event.deltaY);
}

export async function setLocalStorage(page: Page, action: BLStorageEvent) {
  let storage = action.storage;
  for (const key in storage) {
    let value = storage[key];
    await page.evaluate((obj) => localStorage.setItem(obj.key, obj.value), { key, value });
  }
}

export async function setSessionStorage(page: Page, action: BLStorageEvent) {
  let storage = action.storage;
  for (const key in storage) {
    let value = storage[key];
    await page.evaluate((obj) => sessionStorage.setItem(obj.key, obj.value), { key, value });
  }
}

export async function setCookie(page: Page, action: BLCookieEvent) {
  for (const cookie of action.cookie.split(';')) {
    await page.evaluate((cookie) => (document.cookie = cookie), cookie);
  }
}
