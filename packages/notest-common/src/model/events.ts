export * from './http.event';
export * from './dom.event';
export * from './json.type';

export type BLEventType =
  | 'device'
  | 'console'
  | 'http'
  | 'dom'
  | 'performance'
  | 'error'
  | 'cookie'
  | 'tab'
  | 'devtools'
  | 'keyboard'
  | 'storage'
  | 'mouse'
  | 'media'
  | 'page'
  | 'window'
  | 'user'
  | 'session';
export type BLEventName =
  | 'report'
  | 'note'
  | 'device-information'
  | 'cookie-data'
  | 'request-abort'
  | 'request-error'
  | 'before-request'
  | 'before-response'
  | 'after-response'
  | 'tab-data'
  | 'tab-opened'
  | 'tab-closed'
  | 'dom-change'
  | 'dom-full'
  | 'css-add'
  | 'css-remove'
  | 'map-created'
  | 'console-assert'
  | 'console-clear'
  | 'console-count'
  | 'console-countReset'
  | 'console-debug'
  | 'console-dir'
  | 'console-dirxml'
  | 'console-error'
  | 'console-group'
  | 'console-groupCollapsed'
  | 'console-groupEnd'
  | 'console-info'
  | 'console-log'
  | 'console-table'
  | 'console-time'
  | 'console-timeEnd'
  | 'console-timeLog'
  | 'console-trace'
  | 'console-warn'
  | 'cpu'
  | 'memory'
  | 'timing'
  | 'devtools-open'
  | 'global-error'
  | 'global-promise'
  | 'keyup'
  | 'keydown'
  | 'input'
  | 'value'
  | 'checked'
  | 'session-update'
  | 'local-update'
  | 'session-full'
  | 'local-full'
  | 'play'
  | 'pause'
  | 'visibility'
  | 'referrer'
  | 'network'
  | 'address'
  | 'hash'
  | 'resize'
  | 'touchmove'
  | 'mousemove'
  | 'mouseup'
  | 'mousedown'
  | 'click'
  | 'contextmenu'
  | 'dblclick'
  | 'touchstart'
  | 'touchend'
  | 'scroll'
  | 'elementscroll'
  | 'session-start'
  | 'user-email'
  | 'user-start'
  | 'user-stop'
  | 'storage'
  | 'device'
  | 'cookie-details'
  | 'wheel';

export interface BLEvent {
  name: BLEventName;
  type?: BLEventType;
  timestamp: number;
}

export interface BLEventWithTarget extends BLEvent {
  target?: EventTarget;
  currentTarget?: EventTarget;
}

export interface BLSessionReference {
  sid: number;
  tab: number;
  url: string;
  timestamp: number;
}

export interface BLSessionEvent extends BLEvent, BLSessionReference {
  [other: string]: any;
}

export interface BLCookieEvent extends BLEvent {
  cookie: string;
}

export interface BLCookieDetailsEvent extends BLEvent {
  details: { domain: string; path: string; name: string; value: string }[];
}

export type BLGlobalErrorEvent = BLEvent & {
  message: string;
  source: string;
  lineno: string;
  colno: string;
  error: string;
  filename: string;
  stack: string;
};
export type BLGlobalPromiseErrorEvent = BLEvent & {
  reason: string;
  filename: string;
  stack: string;
};
export type BLDevtoolsEvent = BLEvent & { open: boolean };
export type BLCrossTabEvent = BLEvent & Required<{ tab: number }>;
export type BLCrossTabAddEvent = BLEvent & { tab: number };
export type BLCrossTabRemoveEvent = BLEvent & { tab: number };
export type BLCssRuleAddEvent = BLEvent & {
  index: number;
  rule: string;
  target: StyleSheet['ownerNode'];
};
export type BLCssRuleRemoveEvent = BLEvent & {
  index: number;
  target: StyleSheet['ownerNode'];
};
export type BLPerformanceCpuEvent = BLEvent & { performance: number };
export type BLPerformanceMemoryEvent = BLEvent & {
  memory: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};
export type BLPerformanceTimingEvent = BLEvent & { timing: PerformanceTiming };
export type BLMediaEvent = BLEvent & { target };
export type BLWindowResizeEvent = BLEvent & { width: number; height: number };
export type BLPageVisibilityEvent = BLEvent & { active: boolean };
export type BLPageReferrerEvent = BLEvent & { referrer: string; url: string };
export type BLNetworkEvent = BLEvent & { online: boolean };
export type BLPageAdressEvent = BLEvent & { address: string };
export type BLPageHashEvent = BLEvent & { hash: string };
export type BLKeyboardEvent = BLEventWithTarget & {
  code: string;
  key: string;
  locale: string;
  modifier: string;
};
export type BLInputChangeEvent = BLEventWithTarget & {
  value: string | boolean;
};
export type BLInputCheckboxChangeEvent = BLEventWithTarget & {
  checked: string | boolean;
};

export interface BLStorageEvent extends BLEvent {
  storage: { [k: string]: string };
}

export interface BLMoveEvent extends BLEventWithTarget {
  moves: { x: number; y: number; at: number }[];
  x: number;
  y: number;
}

export interface BLMouseEvent extends BLEventWithTarget {
  x: number;
  y: number;
  relative?: { x: number; y: number };
  relativeCT?: { x: number; y: number };
  name:
    | 'touchmove'
    | 'mousemove'
    | 'mouseup'
    | 'mousedown'
    | 'click'
    | 'contextmenu'
    | 'dblclick'
    | 'touchstart'
    | 'touchend';
}

export interface BLScrollEvent extends BLEventWithTarget {
  x: number;
  y: number;
  name: 'scroll' | 'elementscroll';
}

export interface BLWheelEvent extends BLEventWithTarget {
  deltaX: number;
  deltaY: number;
  name: 'wheel';
}

export interface BLDeviceEvent extends BLEvent {
  device: any; //DeviceInfo;
}

export interface BLMonitor {
  enable(): void;

  disable(): void;
}

export interface Gpu {
  performance: Performance;
  renderer: string;
  renderer2: string;
  vendor: string;
  vendor2: string;
}

export interface DeviceInfo {
  userAgent: string;
  screen: {
    availHeight: number;
    availWidth: number;
    colorDepth: number;
    height: number;
    orientation: string;
    pixelDepth: number;
    width: number;
  };
  dpi: number;
  timeZone: string;
  timeZoneOffset: number;
  language: string;
  platform: string;
  vendor: string;
  cpuCores: number;
  gpu: Gpu;
}

export interface BLNote extends BLEvent {
  name: 'note';
  type: 'user';
  notes: PostItMarker[];
}

export interface PostItMarker {
  position: { x: number; y: number };
  value: string;
}
