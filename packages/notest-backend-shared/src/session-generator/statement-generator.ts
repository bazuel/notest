import {
  BLEventName,
  BLMouseEvent,
  BLPageReferrerEvent,
  BLWheelEvent,
  BLWindowResizeEvent
} from '@notest/common';
import { globalConfig } from '../shared/services/config.service';

export const actionWhitelists: BLEventName[] = [
  'mousedown',
  'mouseup',
  'mousemove',
  'resize',
  'contextmenu',
  'referrer',
  'wheel',
  'input'
];

let status = { mode: '' };

export function setMode(mode: 'local' | 'remote') {
  status.mode = mode;
}

export const generateStatement: Partial<{ [k in BLEventName]: (a?) => string }> = {
  mousedown: generateMouseDown,
  mouseup: generateMouseUp,
  mousemove: generateMouseMove,
  contextmenu: generateRightClick,
  referrer: generateReferrer,
  resize: generateResize,
  input: generateInput,
  wheel: generateElementScroll
};

function generateMouseDown() {
  return 'await page.mouse.down();';
}

function generateMouseUp() {
  return 'await page.mouse.up();';
}

function generateRightClick(event: BLMouseEvent) {
  return `await page.mouse.click(${event.x}, ${event.y}, {button: 'right'});`;
}

function generateReferrer(event: BLPageReferrerEvent) {
  let url = '';
  if (status.mode === 'local') {
    const localhost = globalConfig.app_url;
    //change domain from prod to localhost
    const host = new URL(event.url).origin;
    url = event.url.replace(host, localhost);
  } else {
    url = event.url;
  }
  return `await page.goto('${url}');`;
}

function generateResize(event: BLWindowResizeEvent) {
  return `await page.setViewportSize({width: ${event.width}, height: ${event.height}});`;
}

function generateInput(event) {
  const { x, y, width, height } = event.target.rect;
  const point = { x: x + width / 2, y: y + height / 2 };
  return `await page.locator('xy=${point.x},${point.y}').first().fill('${event.value}');`;
}

function generateMouseMove(event: BLMouseEvent) {
  return `await page.mouse.move(${event.x}, ${event.y});`;
}

function generateElementScroll(event: BLWheelEvent) {
  return `await page.mouse.wheel(${event.deltaX},${event.deltaY});`;
}
