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

let lastInputValue = '';
export async function executeInput(page: Page, event) {
  if (!['input', 'textarea'].includes(event.target.tag.toLowerCase())) return;

  const { x, y, width, height } = event.target.rect;
  const point = { x: x + width / 2, y: y + height / 2 };
  let locator = page.locator(`xy=${point.x},${point.y}`).locator('input:visible, textarea:visible');

  if ((await locator.count()) > 1) locator = locator.first();

  if (event.value == lastInputValue) return;
  if (event.value.includes(lastInputValue)) {
    await locator.type(event.value.at(-1));
    lastInputValue = event.value;
  } else {
    await locator.fill(event.value, { force: true });
    lastInputValue = event.value;
  }

  // const text: string = event.value;
  // let textWithoutLastChar = text;
  // let char = '';
  //
  // if (text.length > 0) {
  //   char = text[text.length - 1];
  //   textWithoutLastChar = text.slice(0, -1);
  // }
  // await locator.fill(textWithoutLastChar, { force: true });
  // // await locator.press(char);
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
