import {
  BLCookieEvent,
  BLCrossTabEvent,
  BLCssRuleAddEvent,
  BLCssRuleRemoveEvent,
  BLDeviceEvent,
  BLDevtoolsEvent,
  BLDomEvent,
  BLDomMapEvent,
  BLEvent,
  BLEventName,
  BLEventType,
  BLGlobalErrorEvent,
  BLGlobalPromiseErrorEvent,
  BLHTTPAbortEvent,
  BLHTTPBeforeResponseEvent,
  BLHTTPErrorEvent,
  BLHTTPRequestEvent,
  BLHTTPResponseEvent,
  BLInputChangeEvent,
  BLInputCheckboxChangeEvent,
  BLKeyboardEvent,
  BLMediaEvent,
  BLMouseEvent,
  BLNetworkEvent,
  BLNote,
  BLPageAdressEvent,
  BLPageHashEvent,
  BLPageReferrerEvent,
  BLPageVisibilityEvent,
  BLPerformanceCpuEvent,
  BLPerformanceMemoryEvent,
  BLPerformanceTimingEvent,
  BLScrollEvent,
  BLStorageEvent, BLWheelEvent,
  BLWindowResizeEvent
} from '@notest/common';

type Dispatcher<T> = ((event?: Partial<T>) => BLEvent) & {
  eventName: BLEventName;
  eventType: BLEventType;
  on(handler: (e: T) => void);
};

const eventTypes: { [t in BLEventType]: BLEventName[] } = {} as any;
const dispatcher = <T extends BLEvent>(
  eventType: BLEventType,
  eventName: BLEventName
): Dispatcher<T> => {
  const fullEventName: string = `buglink.${eventType}.${eventName}`;
  eventTypes[eventType] = eventTypes[eventType] || [];
  eventTypes[eventType].push(eventName);
  let dispatcherFunction = (event?: T) => {
    let e = event ? ({ ...event } as unknown as BLEvent) : ({} as BLEvent);
    e.name = eventName;
    e.type = eventType;
    if (!e.timestamp) e.timestamp = new Date().getTime();
    document.dispatchEvent(new CustomEvent(fullEventName, { detail: e }));
    return e;
  };
  (dispatcherFunction as any).eventName = eventName;
  (dispatcherFunction as any).eventType = eventType;
  (dispatcherFunction as any).on = (h) => {
    document.addEventListener(fullEventName, (c: Event) => {
      if ((c as CustomEvent).detail) h((c as CustomEvent).detail);
    });
  };
  return dispatcherFunction as Dispatcher<T>;
};
const d = dispatcher;

const events = {
  user: {
    note: d<BLNote>('user', 'note'),
    report: d<BLEvent>('user', 'report')
  },
  device: {
    information: d<BLDeviceEvent>('device', 'device-information')
  },
  cookie: {
    data: d<BLCookieEvent>('cookie', 'cookie-data')
  },
  http: {
    abort: d<BLHTTPAbortEvent>('http', 'request-abort'),
    error: d<BLHTTPErrorEvent>('http', 'request-error'),
    before_request: d<BLHTTPRequestEvent>('http', 'before-request'),
    before_response: d<BLHTTPBeforeResponseEvent>('http', 'before-response'),
    after_response: d<BLHTTPResponseEvent>('http', 'after-response')
  },
  tab: {
    data: d<BLCrossTabEvent>('tab', 'tab-data'),
    opened: d<BLCrossTabEvent>('tab', 'tab-opened'),
    closed: d<BLCrossTabEvent>('tab', 'tab-closed')
  },
  dom: {
    change: d<BLDomEvent>('dom', 'dom-change'),
    full: d<BLDomEvent>('dom', 'dom-full'),
    css_add: d<BLCssRuleAddEvent>('dom', 'css-add'),
    css_remove: d<BLCssRuleRemoveEvent>('dom', 'css-remove'),
    map_created: d<BLDomMapEvent>('dom', 'map-created')
  },
  performance: {
    cpu: d<BLPerformanceCpuEvent>('performance', 'cpu'),
    memory: d<BLPerformanceMemoryEvent>('performance', 'memory'),
    timing: d<BLPerformanceTimingEvent>('performance', 'timing')
  },
  devtools: {
    open: d<BLDevtoolsEvent>('devtools', 'devtools-open')
  },
  error: {
    global: d<BLGlobalErrorEvent>('error', 'global-error'),
    promise: d<BLGlobalPromiseErrorEvent>('error', 'global-promise')
  },
  keyboard: {
    up: d<BLKeyboardEvent>('keyboard', 'keyup'),
    down: d<BLKeyboardEvent>('keyboard', 'keydown'),
    input: d<BLInputChangeEvent>('keyboard', 'input'),
    value: d<BLInputChangeEvent>('keyboard', 'value'),
    checked: d<BLInputCheckboxChangeEvent>('keyboard', 'checked')
  },
  storage: {
    session_update: d<BLStorageEvent>('storage', 'session-update'),
    local_update: d<BLStorageEvent>('storage', 'local-update'),
    session_full: d<BLStorageEvent>('storage', 'session-full'),
    local_full: d<BLStorageEvent>('storage', 'local-full')
  },
  media: {
    play: d<BLMediaEvent>('media', 'play'),
    pause: d<BLMediaEvent>('media', 'pause')
  },
  page: {
    visibility: d<BLPageVisibilityEvent>('page', 'visibility'),
    referrer: d<BLPageReferrerEvent>('page', 'referrer'),
    network: d<BLNetworkEvent>('page', 'network'),
    address: d<BLPageAdressEvent>('page', 'address'),
    hash: d<BLPageHashEvent>('page', 'hash')
  },
  window: {
    resize: d<BLWindowResizeEvent>('window', 'resize')
  },
  mouse: {
    touchmove: d<BLMouseEvent>('mouse', 'touchmove'),
    mousemove: d<BLMouseEvent>('mouse', 'mousemove'),
    mouseup: d<BLMouseEvent>('mouse', 'mouseup'),
    mousedown: d<BLMouseEvent>('mouse', 'mousedown'),
    click: d<BLMouseEvent>('mouse', 'click'),
    contextmenu: d<BLMouseEvent>('mouse', 'contextmenu'),
    dblclick: d<BLMouseEvent>('mouse', 'dblclick'),
    touchstart: d<BLMouseEvent>('mouse', 'touchstart'),
    touchend: d<BLMouseEvent>('mouse', 'touchend'),
    scroll: d<BLScrollEvent>('mouse', 'scroll'),
    elementscroll: d<BLScrollEvent>('mouse', 'elementscroll'),
    wheel: d<BLWheelEvent>('mouse', 'wheel')
  },
  session: {
    start: d<BLEvent & { name: 'session-start'; type: 'session' }>('session', 'session-start'),
    useremail: d<BLEvent & { name: 'user-email'; type: 'session'; email: string }>(
      'session',
      'user-email'
    ),
    userstart: d<BLEvent & { name: 'user-start'; type: 'session' }>('session', 'user-start'),
    userstop: d<BLEvent & { name: 'user-stop'; type: 'session' }>('session', 'user-stop')
  },
  list: (...names: BLEventName[]) => {
    return names;
  },
  name: (name: BLEventName) => {
    return name;
  },
  type: (...type: BLEventType[]) => {
    let ns: BLEventName[] = [];
    for (let t of type) ns.push(...eventTypes[t]);
    return ns;
  },
  types: (...types: BLEventType[]) => {
    return types;
  }
};

export const blevent = events;

export const activityRelatedEventNames: BLEventName[] = [
  'dom-full',
  ...blevent.type('mouse'),
  'keydown',
  'keyup',
  'note'
];
