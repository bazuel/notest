// src/utils/on.event.ts
function on(type, fn, target = document) {
  const options = { capture: true, passive: true };
  if (target)
    target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}

// ../notest-common/dist/index.esm.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var u32 = Uint32Array;
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i2 = 0; i2 < 31; ++i2) {
    b[i2] = start += 1 << eb[i2 - 1];
  }
  var r = new u32(b[30]);
  for (var i2 = 1; i2 < 30; ++i2) {
    for (var j = b[i2]; j < b[i2 + 1]; ++j) {
      r[j] = j - b[i2] << 5 | i2;
    }
  }
  return [b, r];
};
var _a = freb(fleb, 2);
var fl = _a[0];
var revfl = _a[1];
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b[0];
var revfd = _b[1];
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >>> 1 | (i & 21845) << 1;
  x = (x & 52428) >>> 2 | (x & 13107) << 2;
  x = (x & 61680) >>> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >>> 8 | (x & 255) << 8) >>> 1;
}
var x;
var i;
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var et = /* @__PURE__ */ new u8(0);
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var eventTypes = {};
var dispatcher = (eventType, eventName) => {
  const fullEventName = `buglink.${eventType}.${eventName}`;
  eventTypes[eventType] = eventTypes[eventType] || [];
  eventTypes[eventType].push(eventName);
  let dispatcherFunction = (event) => {
    let e = event ? { ...event } : {};
    e.name = eventName;
    e.type = eventType;
    if (!e.timestamp)
      e.timestamp = new Date().getTime();
    document.dispatchEvent(new CustomEvent(fullEventName, { detail: e }));
    return e;
  };
  dispatcherFunction.eventName = eventName;
  dispatcherFunction.eventType = eventType;
  dispatcherFunction.on = (h) => {
    document.addEventListener(fullEventName, (c) => {
      if (c.detail)
        h(c.detail);
    });
  };
  return dispatcherFunction;
};
var d = dispatcher;
var events = {
  user: {
    note: d("user", "note"),
    report: d("user", "report")
  },
  device: {
    information: d("device", "device-information")
  },
  cookie: {
    data: d("cookie", "cookie-data")
  },
  http: {
    abort: d("http", "request-abort"),
    error: d("http", "request-error"),
    before_request: d("http", "before-request"),
    before_response: d("http", "before-response"),
    after_response: d("http", "after-response")
  },
  tab: {
    data: d("tab", "tab-data"),
    opened: d("tab", "tab-opened"),
    closed: d("tab", "tab-closed")
  },
  dom: {
    change: d("dom", "dom-change"),
    full: d("dom", "dom-full"),
    css_add: d("dom", "css-add"),
    css_remove: d("dom", "css-remove"),
    map_created: d("dom", "map-created")
  },
  performance: {
    cpu: d("performance", "cpu"),
    memory: d("performance", "memory"),
    timing: d("performance", "timing")
  },
  devtools: {
    open: d("devtools", "devtools-open")
  },
  error: {
    global: d("error", "global-error"),
    promise: d("error", "global-promise")
  },
  keyboard: {
    up: d("keyboard", "keyup"),
    down: d("keyboard", "keydown"),
    input: d("keyboard", "input"),
    value: d("keyboard", "value"),
    checked: d("keyboard", "checked")
  },
  storage: {
    session_update: d("storage", "session-update"),
    local_update: d("storage", "local-update"),
    session_full: d("storage", "session-full"),
    local_full: d("storage", "local-full")
  },
  media: {
    play: d("media", "play"),
    pause: d("media", "pause")
  },
  page: {
    visibility: d("page", "visibility"),
    referrer: d("page", "referrer"),
    network: d("page", "network"),
    address: d("page", "address"),
    hash: d("page", "hash")
  },
  window: {
    resize: d("window", "resize")
  },
  mouse: {
    touchmove: d("mouse", "touchmove"),
    mousemove: d("mouse", "mousemove"),
    mouseup: d("mouse", "mouseup"),
    mousedown: d("mouse", "mousedown"),
    click: d("mouse", "click"),
    contextmenu: d("mouse", "contextmenu"),
    dblclick: d("mouse", "dblclick"),
    touchstart: d("mouse", "touchstart"),
    touchend: d("mouse", "touchend"),
    scroll: d("mouse", "scroll"),
    elementscroll: d("mouse", "elementscroll")
  },
  session: {
    start: d("session", "session-start"),
    useremail: d(
      "session",
      "user-email"
    ),
    userstart: d("session", "user-start"),
    userstop: d("session", "user-stop")
  },
  list: (...names) => {
    return names;
  },
  name: (name) => {
    return name;
  },
  type: (...type) => {
    let ns = [];
    for (let t of type)
      ns.push(...eventTypes[t]);
    return ns;
  },
  types: (...types) => {
    return types;
  }
};
var blevent = events;
var activityRelatedEventNames = [
  "dom-full",
  ...blevent.type("mouse"),
  "keydown",
  "keyup",
  "note"
];
function throttle(func, wait) {
  let timeout;
  let previous = 0;
  return function(_arg) {
    let now = Date.now();
    let remaining = wait - (now - previous);
    let context = this;
    let args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}
var RequestAnimationFrameTimer = class {
  reqAniFrameId = 0;
  baseRafTime = 0;
  end = false;
  constructor() {
    this.resetTimer();
  }
  stop() {
    this.end = true;
  }
  start(callback) {
    this.end = false;
    let lastTime = 0;
    let internalCallback = (t) => {
      const timeFromBase = t - this.baseRafTime;
      callback(t - lastTime, timeFromBase);
      lastTime = t;
      cancelAnimationFrame(this.reqAniFrameId);
      if (!this.end)
        this.reqAniFrameId = requestAnimationFrame(internalCallback);
    };
    this.reqAniFrameId = requestAnimationFrame(internalCallback);
  }
  resetTimer() {
    const x2 = requestAnimationFrame((t) => {
      this.baseRafTime = t;
      cancelAnimationFrame(x2);
    });
  }
};

// src/model/dispatched.events.ts
var eventTypes2 = {};
var dispatcher2 = (eventType, eventName) => {
  const fullEventName = `buglink.${eventType}.${eventName}`;
  eventTypes2[eventType] = eventTypes2[eventType] || [];
  eventTypes2[eventType].push(eventName);
  let dispatcherFunction = (event) => {
    let e = event ? { ...event } : {};
    e.name = eventName;
    e.type = eventType;
    if (!e.timestamp)
      e.timestamp = new Date().getTime();
    document.dispatchEvent(new CustomEvent(fullEventName, { detail: e }));
    return e;
  };
  dispatcherFunction.eventName = eventName;
  dispatcherFunction.eventType = eventType;
  dispatcherFunction.on = (h) => {
    document.addEventListener(fullEventName, (c) => {
      if (c.detail)
        h(c.detail);
    });
  };
  return dispatcherFunction;
};
var d2 = dispatcher2;
var events2 = {
  user: {
    note: d2("user", "note"),
    report: d2("user", "report")
  },
  device: {
    information: d2("device", "device-information")
  },
  cookie: {
    data: d2("cookie", "cookie-data")
  },
  http: {
    abort: d2("http", "request-abort"),
    error: d2("http", "request-error"),
    before_request: d2("http", "before-request"),
    before_response: d2("http", "before-response"),
    after_response: d2("http", "after-response")
  },
  tab: {
    data: d2("tab", "tab-data"),
    opened: d2("tab", "tab-opened"),
    closed: d2("tab", "tab-closed")
  },
  dom: {
    change: d2("dom", "dom-change"),
    full: d2("dom", "dom-full"),
    css_add: d2("dom", "css-add"),
    css_remove: d2("dom", "css-remove"),
    map_created: d2("dom", "map-created")
  },
  performance: {
    cpu: d2("performance", "cpu"),
    memory: d2("performance", "memory"),
    timing: d2("performance", "timing")
  },
  devtools: {
    open: d2("devtools", "devtools-open")
  },
  error: {
    global: d2("error", "global-error"),
    promise: d2("error", "global-promise")
  },
  keyboard: {
    up: d2("keyboard", "keyup"),
    down: d2("keyboard", "keydown"),
    input: d2("keyboard", "input"),
    value: d2("keyboard", "value"),
    checked: d2("keyboard", "checked")
  },
  storage: {
    session_update: d2("storage", "session-update"),
    local_update: d2("storage", "local-update"),
    session_full: d2("storage", "session-full"),
    local_full: d2("storage", "local-full")
  },
  media: {
    play: d2("media", "play"),
    pause: d2("media", "pause")
  },
  page: {
    visibility: d2("page", "visibility"),
    referrer: d2("page", "referrer"),
    network: d2("page", "network"),
    address: d2("page", "address"),
    hash: d2("page", "hash")
  },
  window: {
    resize: d2("window", "resize")
  },
  mouse: {
    touchmove: d2("mouse", "touchmove"),
    mousemove: d2("mouse", "mousemove"),
    mouseup: d2("mouse", "mouseup"),
    mousedown: d2("mouse", "mousedown"),
    click: d2("mouse", "click"),
    contextmenu: d2("mouse", "contextmenu"),
    dblclick: d2("mouse", "dblclick"),
    touchstart: d2("mouse", "touchstart"),
    touchend: d2("mouse", "touchend"),
    scroll: d2("mouse", "scroll"),
    elementscroll: d2("mouse", "elementscroll"),
    wheel: d2("mouse", "wheel")
  },
  session: {
    start: d2("session", "session-start"),
    useremail: d2(
      "session",
      "user-email"
    ),
    userstart: d2("session", "user-start"),
    userstop: d2("session", "user-stop")
  },
  list: (...names) => {
    return names;
  },
  name: (name) => {
    return name;
  },
  type: (...type) => {
    let ns = [];
    for (let t of type)
      ns.push(...eventTypes2[t]);
    return ns;
  },
  types: (...types) => {
    return types;
  }
};
var blevent2 = events2;
var activityRelatedEventNames2 = [
  "dom-full",
  ...blevent2.type("mouse"),
  "keydown",
  "keyup",
  "note"
];

// src/monitors/mouse.monitor.ts
var MouseMonitor = class {
  disableMonitoring = () => {
  };
  enable() {
    function mouseEventMapper(evt, processBoundingRect = true) {
      const { target, currentTarget } = evt;
      const isTouch = !!evt.changedTouches;
      const { clientX, clientY } = isTouch ? evt.changedTouches[0] : evt;
      let data = {
        x: clientX,
        y: clientY,
        target,
        currentTarget
      };
      if (processBoundingRect) {
        let rect = target.getBoundingClientRect();
        let relative = { x: clientX - rect.left, y: clientY - rect.top };
        data.relative = relative;
        if (evt.currentTarget && evt.currentTarget.getBoundingClientRect) {
          try {
            let rectCT = currentTarget.getBoundingClientRect();
            let relativeCT = { x: clientX - rectCT.left, y: clientY - rectCT.top };
            data.relativeCT = relativeCT;
            data.currentTarget = evt.currentTarget;
          } catch (e) {
          }
        }
      }
      return data;
    }
    const updatePosition = throttle((evt) => {
      let data = mouseEventMapper(evt, false);
      data.name = !!evt.changedTouches ? "touchmove" : "mousemove";
      if (data.name == blevent2.name("touchmove"))
        blevent2.mouse.touchmove(data);
      else
        blevent2.mouse.mousemove(data);
    }, 50);
    const handlers = [on("mousemove", updatePosition), on("touchmove", updatePosition)];
    let restoreOriginals = [...handlers];
    let events3 = blevent2.list(
      "mouseup",
      "mousedown",
      "click",
      "contextmenu",
      "dblclick",
      "touchstart",
      "touchend"
    );
    for (let e of events3) {
      restoreOriginals.push(
        on(e, (evt) => {
          let data = { ...mouseEventMapper(evt), name: e };
          blevent2.mouse[e](data);
        })
      );
    }
    this.disableMonitoring = () => {
      restoreOriginals.forEach((restore) => {
        restore();
      });
    };
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/monitors/cookie.monitor.ts
var CookieMonitor = class {
  interval;
  enable() {
    let lastCookies = "";
    this.interval = setInterval(() => {
      if (document.cookie != lastCookies) {
        lastCookies = document.cookie;
        blevent2.cookie.data({ cookie: lastCookies });
      }
    }, 1e3);
  }
  disable() {
    clearInterval(this.interval);
  }
};

// src/monitors/input.monitor.ts
var InputMonitor = class {
  disableMonitoring = () => {
  };
  enable() {
    const inputs = /* @__PURE__ */ new Map();
    const checked = /* @__PURE__ */ new Map();
    let raf = new RequestAnimationFrameTimer();
    raf.start((ms) => {
      inputs.forEach((e) => {
        blevent2.keyboard.input(e);
      });
      inputs.clear();
      checked.forEach((e) => {
        blevent2.keyboard.checked(e);
      });
      checked.clear();
    });
    const eventHandler = (event) => {
      const { target } = event;
      const { type, name } = target;
      if (type === "checkbox") {
        blevent2.keyboard.checked({
          target: target ?? void 0,
          checked: target?.checked
        });
      } else if (type === "radio") {
        if (name)
          document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
            if (el && el !== target) {
              checked.set(el, {
                target: el,
                checked: el?.checked
              });
            }
          });
        if (target)
          checked.set(target, { target, checked: target?.checked });
      } else {
        let text = target?.value;
        if (target)
          inputs.set(target, { target, value: text });
      }
    };
    let i2 = on("input", eventHandler);
    let c = on("change", eventHandler);
    this.disableMonitoring = () => {
      c();
      i2();
      raf.stop();
    };
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/utils/property.observer.ts
function observeProperty(target, key, propertyDescriptor, restore) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  Object.defineProperty(
    target,
    key,
    restore ? propertyDescriptor : {
      set(value) {
        setTimeout(() => {
          propertyDescriptor.set.call(this, value);
        }, 0);
        if (original && original.set) {
          original.set.call(this, value);
        }
      }
    }
  );
  return () => observeProperty(target, key, original || {}, true);
}

// src/monitors/input-value.monitor.ts
var InputValueMonitor = class {
  disableMonitoring = () => {
  };
  enable() {
    let values = /* @__PURE__ */ new Map();
    let checked = /* @__PURE__ */ new Map();
    let raf = new RequestAnimationFrameTimer();
    raf.start((ms) => {
      values.forEach((e) => {
        blevent2.keyboard.value(e);
      });
      values.clear();
      checked.forEach((e) => {
        blevent2.keyboard.checked(e);
      });
      checked.clear();
    });
    const valueSetter = {
      set() {
        if (this)
          values.set(this, { target: this, value: this.value });
      }
    };
    const checkedSetter = {
      set() {
        if (this)
          checked.set(this, { target: this, checked: this.checked });
      }
    };
    let restoreOriginals = [
      ...[HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement].map(
        (e) => observeProperty(e.prototype, "value", valueSetter)
      ),
      observeProperty(HTMLInputElement.prototype, "checked", checkedSetter)
    ];
    this.disableMonitoring = () => {
      restoreOriginals.forEach((restore) => {
        restore();
      });
      raf.stop();
    };
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/monitors/keyboard.monitor.ts
var KeyboardMonitor = class {
  disableMonitoring = () => {
  };
  enable() {
    let k = [];
    let ev = (e) => ({
      key: e.key,
      code: e.code,
      locale: e.locale,
      modifier: e.ctrlKey ? "ctrl" : e.altKey ? "alt" : e.shiftKey ? "shift" : "none",
      target: e.target
    });
    k.push(on("keyup", (e) => e.code && blevent2.keyboard.up(ev(e))));
    k.push(on("keydown", (e) => e.code && blevent2.keyboard.down(ev(e))));
    this.disableMonitoring = () => k.forEach((restore) => {
      restore();
    });
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/utils/method.observer.ts
function observeMethod(target, method, newMethod) {
  const original = target[method];
  const wrapper = function(...args) {
    let options = {
      skipThrow: false,
      override: null,
      onError: (error) => {
      },
      beforeReturn: (result) => {
        return result;
      },
      executeOriginal: () => {
        return original.apply(this, args);
      }
    };
    newMethod.apply(this, [...args, options]);
    if (options.override) {
      return options.override(args);
    } else {
      try {
        let rv = options.executeOriginal();
        return options.beforeReturn(rv);
      } catch (e) {
        options.onError(e);
        if (!options.skipThrow)
          throw e;
      }
    }
  };
  target[method] = wrapper;
  return function() {
    target[method] = original;
  };
}

// src/monitors/page.monitor.ts
var PageMonitor = class {
  disableMonitoring = () => {
  };
  enable() {
    let pageHash = "";
    let pageAddress = "";
    let prevVisibility = false;
    let vch = (_) => {
      if (prevVisibility != !document.hidden) {
        prevVisibility = !document.hidden;
        blevent2.page.visibility({ active: !document.hidden });
      }
    };
    const hch = (_) => {
      if (pageHash != window.location.hash) {
        pageHash = window.location.hash;
        blevent2.page.hash({ hash: window.location.hash });
      }
    };
    const ach = (_) => {
      if (pageAddress != window.location.href) {
        pageAddress = window.location.href;
        blevent2.page.address({ address: window.location.href });
      }
    };
    const nch_online = (_) => {
      blevent2.page.network({ online: true });
    };
    const nch_offline = (_) => {
      blevent2.page.network({ online: false });
    };
    document.addEventListener("visibilitychange", vch);
    window.addEventListener("hashchange", hch);
    window.addEventListener("offline", nch_offline);
    window.addEventListener("online", nch_online);
    const restorePushState = observeMethod(window.history, "pushState", (_) => {
      ach();
    });
    const restoreReplaceState = observeMethod(window.history, "replaceState", (_) => {
      ach();
    });
    window.addEventListener("popstate", ach);
    const visibilityCheck = setInterval(vch, 1e3);
    this.disableMonitoring = () => {
      window.removeEventListener("hashchange", hch);
      document.removeEventListener("visibilitychange", vch);
      window.removeEventListener("online", nch_online);
      window.removeEventListener("offline", nch_offline);
      window.removeEventListener("popstate", ach);
      restorePushState();
      restoreReplaceState();
      clearInterval(visibilityCheck);
    };
    blevent2.page.referrer({ referrer: document.referrer, url: document.URL });
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/monitors/scroll.monitor.ts
var ScrollMonitor = class {
  disableScroll = () => {
  };
  enable() {
    const updatePosition = throttle((evt) => {
      this.manageScrollEvent(evt);
    }, 50);
    this.disableScroll = on("scroll", updatePosition);
  }
  manageScrollEvent(evt) {
    const scrollEl = evt.target;
    let x2 = scrollEl.scrollLeft;
    let y = scrollEl.scrollTop;
    if (evt.target == document) {
      x2 = window.scrollX;
      y = window.scrollY;
    }
    let data = {
      x: x2,
      y,
      target: evt.target,
      currentTarget: evt.currentTarget
    };
    if (evt.target === document)
      blevent2.mouse.scroll(data);
    else
      blevent2.mouse.elementscroll(data);
  }
  disable() {
    this.disableScroll();
  }
};

// src/monitors/storage.monitor.ts
var StorageMonitor = class {
  constructor(options = { intervalTimeForFullEvent: -1 }) {
    this.options = options;
  }
  disableMonitoring = () => {
  };
  serializeStorage(storage) {
    const ls = {};
    for (let i2 = 0; i2 < storage.length; i2++) {
      const k = storage.key(i2);
      const v = storage.getItem(k);
      ls[k] = v;
    }
    return { storage: ls };
  }
  fireFullEvents() {
    blevent2.storage.session_full(this.serializeStorage(sessionStorage));
    blevent2.storage.local_full(this.serializeStorage(localStorage));
  }
  enable() {
    this.fireFullEvents();
    let full;
    if (this.options.intervalTimeForFullEvent > 0) {
      full = setInterval(() => {
        this.fireFullEvents();
      }, this.options.intervalTimeForFullEvent);
    }
    let el = (e) => {
      if (e.key) {
        let v = {};
        v[e.key] = e.newValue;
        if (e.storageArea === localStorage)
          blevent2.storage.local_update({ storage: v });
        else
          blevent2.storage.session_update({ storage: v });
      }
    };
    window.addEventListener("storage", el);
    this.disableMonitoring = () => {
      window.removeEventListener("storage", el);
      if (full)
        clearInterval(full);
    };
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/monitors/window-resize.monitor.ts
var WindowResizeMonitor = class {
  disableMonitoring = () => {
  };
  enable() {
    function getWindowHeight() {
      return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
    }
    function getWindowWidth() {
      return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
    }
    const updateDimension = throttle(() => {
      const height = getWindowHeight();
      const width = getWindowWidth();
      blevent2.window.resize({
        width: Number(width),
        height: Number(height)
      });
    }, 200);
    updateDimension();
    this.disableMonitoring = on("resize", updateDimension, window);
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/utils/selector-finder.util.ts
var ElementSelectorFinder = class {
  findUniqueSelector(element) {
    if (!element)
      throw new Error("Element input is mandatory");
    if (!element.ownerDocument)
      throw new Error("Element should be part of a document");
    let selector = flatSelector(element) + nthChild(element);
    let foundElements = element.ownerDocument.querySelectorAll(selector);
    while (foundElements.length > 1 && element.parentElement) {
      element = element.parentElement;
      let parentSelector = flatSelector(element) + nthChild(element);
      selector = `${parentSelector} > ${selector}`;
      foundElements = element.ownerDocument.querySelectorAll(selector);
    }
    return selector;
  }
};
function nthChild(element) {
  let nthSelector = "";
  const parent = element.parentNode;
  if (parent) {
    let elementSelector = flatSelector(element);
    let children = Array.from(parent.children);
    const brothersHavingSameSelectorCount = children.map((c) => flatSelector(c)).filter((s) => s == elementSelector);
    if (brothersHavingSameSelectorCount.length > 1) {
      let elementChildIndex = Array.from(parent.children).indexOf(element) + 1;
      nthSelector = `:nth-child(${elementChildIndex})`;
    }
  }
  return nthSelector;
}
function attributes(element, attributesWhiteList = ["name", " value", "title", "for", "type"]) {
  const attributesSelector = [];
  const { attributes: attributes2 } = element;
  for (let a of Array.from(attributes2)) {
    if (attributesWhiteList.indexOf(a.nodeName.toLowerCase()) > -1) {
      attributesSelector.push(`[${a.nodeName.toLowerCase()}${a.value ? `="${a.value}"` : ""}]`);
    }
  }
  return attributesSelector.join("");
}
function flatSelector(element) {
  return tag(element) + id(element) + attributes(element) + classes(element);
}
function classes(element) {
  let classSelectorList = [];
  if (element.hasAttribute("class")) {
    try {
      const classList = Array.from(element.classList);
      classSelectorList = classList.filter(
        (item) => !/^[a-z_-][a-z\d_-]*$/i.test(item) ? null : item
      );
    } catch (e) {
      let className = element.getAttribute("class") ?? "";
      className = className.trim().replace(/\s+/g, " ");
      classSelectorList = className.split(" ");
    }
  }
  return classSelectorList.map((c) => "." + c).join("");
}
function id(element) {
  const id2 = element.getAttribute("id");
  if (id2 !== null && id2 !== "") {
    return id2.match(/(?:^\d|:)/) ? `[id="${id2}"]` : "#" + id2;
  }
  return "";
}
function tag(element) {
  return element.tagName.toLowerCase().replace(/:/g, "\\:");
}

// src/utils/fetch.hook.ts
function buildFetchHook() {
  const support = {
    searchParams: "URLSearchParams" in self,
    iterable: "Symbol" in self && "iterator" in Symbol,
    blob: "FileReader" in self && "Blob" in self && function() {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    }(),
    formData: "FormData" in self,
    arrayBuffer: "ArrayBuffer" in self
  };
  function parseHeaders(rawHeaders) {
    let headers = new Headers();
    let preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      let parts = line.split(":");
      let key = parts.shift().trim();
      if (key) {
        let value = parts.join(":").trim();
        headers.append(key, value);
      }
    });
    return headers;
  }
  function fetch(input, init) {
    return new Promise(async function(resolve, reject) {
      const inputIsRequest = input instanceof Request;
      let request = inputIsRequest ? input : new Request(input, init);
      if (request.signal && request.signal.aborted) {
        return reject(new DOMException("Aborted", "AbortError"));
      }
      let xhr = new XMLHttpRequest();
      function abortXhr() {
        xhr.abort();
      }
      xhr.onload = function() {
        let options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || "")
        };
        options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
        let body2 = "response" in xhr ? xhr.response : xhr.responseText;
        setTimeout(function() {
          let rs = new Response(body2, options);
          Object.defineProperty(rs, "url", { value: request.url });
          resolve(rs);
        }, 0);
      };
      xhr.onerror = function() {
        setTimeout(function() {
          reject(new TypeError("Network request failed"));
        }, 0);
      };
      xhr.ontimeout = function() {
        setTimeout(function() {
          reject(new TypeError("Network request failed"));
        }, 0);
      };
      xhr.onabort = function() {
        setTimeout(function() {
          reject(new DOMException("Aborted", "AbortError"));
        }, 0);
      };
      function fixUrl(url) {
        try {
          return url === "" && self.location.href ? self.location.href : url;
        } catch (e) {
          return url;
        }
      }
      xhr.open(request.method, fixUrl(request.url), true);
      if (request.credentials === "include") {
        xhr.withCredentials = true;
      } else if (request.credentials === "omit") {
        xhr.withCredentials = false;
      }
      if ("responseType" in xhr) {
        if (support.blob) {
          xhr.responseType = "blob";
        } else if (support.arrayBuffer && (request.headers?.get("Content-Type") ?? "").indexOf(
          "application/octet-stream"
        ) !== -1) {
          xhr.responseType = "arraybuffer";
        }
      }
      request.headers.forEach(function(value, name) {
        const skipIfFormData = init && init.body instanceof FormData && name.toLowerCase() == "content-type";
        if (!skipIfFormData)
          xhr.setRequestHeader(name, value);
      });
      if (request.signal) {
        request.signal.addEventListener("abort", abortXhr);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            request.signal.removeEventListener("abort", abortXhr);
          }
        };
      }
      let body = init?.body ?? void 0;
      if (inputIsRequest)
        body = await input.blob();
      xhr.send(body);
    });
  }
  fetch.polyfill = true;
  return {
    fetch
  };
}

// src/monitors/http.monitor.ts
var HttpMonitor = class {
  enabled = false;
  native;
  fetch = self.fetch;
  constructor() {
    this.native = {
      fetch: self.fetch,
      Headers: self.Headers,
      Request: self.Request,
      Response: self.Response,
      xhr: {
        open: XMLHttpRequest.prototype.open
      }
    };
  }
  enable() {
    let { fetch } = buildFetchHook();
    window.fetch = fetch;
    enableXhrHook();
    this.enabled = true;
  }
  disable() {
    self.fetch = this.native.fetch;
    XMLHttpRequest.prototype.open = this.native.xhr.open;
  }
};
function enableXhrHook() {
  const origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
    let baseUrl = "";
    if (url.indexOf("http") != 0) {
      baseUrl = window.location.protocol + "//" + window.location.hostname;
      if (!url.startsWith("/"))
        baseUrl += "/";
    }
    let xhr = this;
    xhr.blhandlers = {};
    let requestData = {
      name: "before-request",
      target: xhr,
      method,
      url: baseUrl + url,
      path: url,
      async,
      user,
      password: pass,
      timestamp: new Date().getTime(),
      headers: {},
      handlers: {},
      originalCallback: xhr.onreadystatechange,
      abort: false
    };
    xhr.httpData = {
      request: requestData,
      response: {}
    };
    let origSetRequestHeader = xhr.setRequestHeader;
    xhr.setRequestHeader = function(header, value) {
      origSetRequestHeader.apply(xhr, [header, value]);
      if (!xhr.httpData.request.headers[header]) {
        xhr.httpData.request.headers[header] = [];
      }
      xhr.httpData.request.headers[header].push(value);
    };
    let origSend = xhr.send;
    xhr.send = function(body) {
      if (body instanceof FormData) {
        let fbody = {};
        for (let pair of body.entries()) {
          fbody[pair[0]] = pair[1];
        }
        xhr.httpData.request.body = fbody;
      } else {
        xhr.httpData.request.body = body;
      }
      let originalCallback = xhr.onreadystatechange;
      xhr.onreadystatechange = function(...rargs) {
        const responseData = {
          name: "before-response",
          target: xhr,
          arguments: rargs,
          originalCallback,
          abort: false,
          request: requestData,
          timestamp: new Date().getTime()
        };
        blevent2.http.before_response(responseData);
        if (!responseData.abort) {
          try {
            if (responseData.originalCallback)
              responseData.originalCallback.bind(xhr)(...responseData.arguments);
            xhr.readyStateManaged = true;
          } catch (_err) {
            if (!xhr.readyStateManaged)
              throw _err;
          }
        }
      };
      requestData.handlers = xhr.blhandlers;
      blevent2.http.before_request(requestData);
      if (!requestData.abort)
        origSend.call(xhr, body);
    };
    xhr.addEventListener("error", function() {
      let e = {
        request: requestData,
        name: "request-error",
        target: xhr,
        timestamp: new Date().getTime()
      };
      blevent2.http.error(e);
    });
    xhr.addEventListener("abort", function() {
      let e = {
        request: requestData,
        name: "request-abort",
        target: xhr,
        timestamp: new Date().getTime()
      };
      blevent2.http.abort(e);
    });
    xhr.addEventListener("load", function() {
      xhr.httpData.response.timestamp = new Date().getTime();
      const headers = {};
      xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).map((value) => value.split(/: /)).forEach((keyValue) => {
        try {
          headers[keyValue[0].trim()] = keyValue[1].trim();
        } catch (he) {
        }
      });
      xhr.httpData.response.headers = headers;
      xhr.httpData.response.status = xhr.status;
      xhr.httpData.response.target = xhr;
      xhr.httpData.response.request = requestData;
      xhr.httpData.response.name = "after-response";
      if (xhr.responseType == "" || xhr.responseType == "text") {
        xhr.httpData.response.body = xhr.responseText;
        blevent2.http.after_response(xhr.httpData.response);
      } else if (xhr.responseType == "blob") {
        let reader = new FileReader();
        reader.addEventListener("loadend", (e) => {
          const text = e.srcElement.result;
          xhr.httpData.response.body = text;
          blevent2.http.after_response(xhr.httpData.response);
        });
        reader.readAsText(xhr.response);
      }
    });
    let originalEventListener = xhr.addEventListener;
    xhr.addEventListener = function(...args) {
      let event = args[0];
      let handler = args[1];
      let useCapture = args[2];
      let newHandler = (...hargs) => {
        const responseData = {
          name: "before-response",
          target: xhr,
          arguments: hargs,
          originalCallback: handler,
          abort: false,
          request: requestData,
          timestamp: new Date().getTime()
        };
        blevent2.http.before_response(responseData);
        if (!responseData.abort) {
          handler.bind(xhr)(...hargs);
          if (event == "readystatechange")
            xhr.readyStateManaged = true;
        }
      };
      xhr.blhandlers[event] = xhr.blhandlers[event] || [];
      xhr.blhandlers[event].push({ handler, useCapture });
      originalEventListener.bind(xhr)(event, newHandler, useCapture);
    };
    origOpen.apply(xhr, arguments);
  };
}

// src/utils/serialize-target.ts
function getElementAttributes(element) {
  let attributes2 = {};
  for (const { name, value } of Array.from(element.attributes ?? [])) {
    attributes2[name] = value;
  }
  return attributes2;
}
async function getElementRect(element) {
  return new Promise((resolve) => {
    const rect = element.getBoundingClientRect();
    resolve({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
  });
}

// src/dom/dom-mutations.monitor.ts
var DomFrameMutationsMonitor = class {
  constructor(callback) {
    this.callback = callback;
    let frameMutations = [];
    this.timer = new RequestAnimationFrameTimer();
    this.timer.start((_) => {
      if (frameMutations.length > 0) {
        this.callback([...frameMutations]);
        frameMutations = [];
      }
    });
    this.mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.timestamp = new Date().getTime();
      });
      frameMutations.push(...mutations);
    });
  }
  timer;
  mo;
  observe(n) {
    this.mo.observe(n, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: false,
      childList: true,
      subtree: true
    });
  }
  disable() {
    try {
      this.mo.disconnect();
      this.timer.stop();
    } catch (e) {
      console.log("Probably the observer was not started using observe()", e);
    }
  }
};

// src/dom/serializer/css-absolute-url.transformer.ts
var CssAbsoluteUrlTransformer = class {
  URL_IN_CSS_REF = /url\((?:'([^']*)'|"([^"]*)"|([^)]*))\)/gm;
  RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/;
  DATA_URI = /^(data:)([\w\/\+\-]+);(charset=[\w-]+|base64).*,(.*)/i;
  transform(cssText, href) {
    return (cssText || "").replace(
      this.URL_IN_CSS_REF,
      (origin, path1, path2, path3) => {
        const filePath = path1 || path2 || path3;
        if (!filePath) {
          return origin;
        } else if (!this.RELATIVE_PATH.test(filePath)) {
          return `url('${filePath}')`;
        } else if (this.DATA_URI.test(filePath)) {
          let u = `url(${filePath})`;
          if (filePath.indexOf('\\"') >= 0)
            u = `url('${filePath}')`;
          else if (filePath.indexOf("\\'") >= 0)
            u = `url("${filePath}")`;
          else if (filePath.indexOf("'") >= 0)
            u = `url("${filePath}")`;
          else if (filePath.indexOf('"') >= 0)
            u = `url('${filePath}')`;
          return u;
        } else if (filePath[0] === "/") {
          return `url('${this.extractOrigin(href) + filePath}')`;
        }
        const stack = href.split("/");
        const parts = filePath.split("/");
        stack.pop();
        for (const part of parts) {
          if (part === ".") {
            continue;
          } else if (part === "..") {
            stack.pop();
          } else {
            stack.push(part);
          }
        }
        return `url('${stack.join("/")}')`;
      }
    );
  }
  proxyUrls(cssText, proxyBasePath) {
    return (cssText || "").replace(
      this.URL_IN_CSS_REF,
      (_, path1, path2, path3) => {
        const filePath = path1 || path2 || path3;
        if (!this.RELATIVE_PATH.test(filePath)) {
          return `url('${proxyBasePath + filePath}')`;
        } else
          return `url('${filePath}')`;
      }
    );
  }
  extractOrigin(url) {
    let origin;
    if (url.indexOf("//") > -1) {
      origin = url.split("/").slice(0, 3).join("/");
    } else {
      origin = url.split("/")[0];
    }
    origin = origin.split("?")[0];
    return origin;
  }
};

// src/dom/serializer/serializer.utils.ts
var DOMSerializerHelper = class {
  letterNumbers = RegExp("[^a-z1-9]");
  a = document.createElement("a");
  tagName(t) {
    const processedTagName = t.toLowerCase().trim();
    return this.letterNumbers.test(processedTagName.replace(/-/g, "")) ? "div" : processedTagName;
  }
  getAbsoluteUrl(url) {
    this.a.href = url;
    return this.a.href;
  }
  getAbsoluteSrcset(attributeValue) {
    if (attributeValue.trim() === "") {
      return attributeValue;
    }
    function matchAll(regExp, str) {
      const matches = [];
      function replacementFunc(all, first) {
        matches.push(first);
      }
      str.replace(regExp, replacementFunc);
      return matches;
    }
    let allSrcSets = matchAll(/[^"\'=\s]+\S[^,]+/g, attributeValue);
    return allSrcSets.map((x2) => {
      let v = x2[0] || "";
      if (v.startsWith(","))
        v = v.substr(1);
      return v;
    }).map((srcItem) => {
      const trimmedSrcItem = srcItem.trimLeft().trimRight();
      const urlAndSize = trimmedSrcItem.split(" ").filter((x2) => x2);
      let value = "";
      if (urlAndSize.length === 2) {
        const absUrl = this.getAbsoluteUrl(urlAndSize[0]);
        value = `${absUrl} ${urlAndSize[1]}`;
      } else if (urlAndSize.length === 1) {
        const absUrl = this.getAbsoluteUrl(urlAndSize[0]);
        value = `${absUrl}`;
      }
      return value;
    }).join(",");
  }
  getAbsoluteUrlsStylesheet(cssText, href = location.href) {
    return new CssAbsoluteUrlTransformer().transform(cssText ?? "", href);
  }
  getElementAttributes(n) {
    let element = n;
    let attributes2 = {};
    for (const { name, value } of Array.from(element.attributes ?? [])) {
      attributes2[name] = this.serializeAttribute(name, value);
    }
    return attributes2;
  }
  serializeAttribute(name, value) {
    if (name === "src" || name === "href" && value) {
      return this.getAbsoluteUrl(value);
    } else if (name === "srcset" && value) {
      return this.getAbsoluteSrcset(value);
    } else if (name === "style" && value) {
      return this.getAbsoluteUrlsStylesheet(value);
    } else {
      return value;
    }
  }
  nodeElementTagAttributes(n) {
    let attributes2 = this.getElementAttributes(n);
    let element = n;
    const tag2 = element instanceof DocumentFragment ? "#document-fragment" : this.tagName(element.tagName);
    return { element, tag: tag2, attributes: attributes2 };
  }
};

// src/dom/serializer/style-attribute.serializer.ts
var StyleAttributeSerializer = class {
  serialize(target, oldValue = "") {
    const styles = {};
    const tempEl = document.createElement("span");
    tempEl.setAttribute("style", oldValue);
    for (let i2 = 0; i2 < target.style.length; i2++) {
      let s = target.style[i2];
      if (target.style.getPropertyValue(s) != tempEl.style.getPropertyValue(s) || target.style.getPropertyPriority(s) != tempEl.style.getPropertyPriority(s)) {
        styles[s] = target.style.getPropertyValue(s);
        if (target.style.getPropertyPriority(s))
          styles[s] += " !important";
      }
    }
    for (let i2 = 0; i2 < tempEl.style.length; i2++) {
      let s = tempEl.style[i2];
      if (target.style.getPropertyValue(s) === "" || !target.style.getPropertyValue(s)) {
        styles[s] = null;
      }
    }
    return styles;
  }
};

// src/dom/serializer/mutation.serializer.ts
var MutationSerializer = class {
  constructor(elementsMap, elIdGenerator, serializer) {
    this.elementsMap = elementsMap;
    this.elIdGenerator = elIdGenerator;
    this.serializer = serializer;
  }
  serialize(mutations) {
    const elementAttributesMap = /* @__PURE__ */ new Map();
    const elementStylesMap = /* @__PURE__ */ new Map();
    const elementTextMap = /* @__PURE__ */ new Map();
    mutations.sort((e1, e2) => {
      return e1.timestamp - e2.timestamp;
    });
    const dsh = new DOMSerializerHelper();
    const removeRecursivelyFromElementsMap = (n) => {
      this.elementsMap.delete(n);
      n.childNodes.forEach((c) => removeRecursivelyFromElementsMap(c));
    };
    let eventMutations = [];
    for (let m of mutations) {
      if (m.type == "attributes" && m.attributeName) {
        const target = m.target;
        const attributeValue = target.getAttribute(m.attributeName);
        if (m.attributeName == "style" && attributeValue && attributeValue.length > 100) {
          if (!elementStylesMap.has(target)) {
            let styles2 = new StyleAttributeSerializer().serialize(target, m.oldValue ?? "");
            elementStylesMap.set(target, {
              styles: styles2,
              oldValue: m.oldValue ?? "",
              timestamp: m.timestamp
            });
          }
          let oldValue = elementStylesMap.get(target).oldValue;
          let styles = new StyleAttributeSerializer().serialize(target, oldValue);
          elementStylesMap.get(target).styles = styles;
          elementStylesMap.get(target).timestamp = m.timestamp;
        } else {
          let value = dsh.serializeAttribute(m.attributeName, attributeValue ?? null);
          if (!elementAttributesMap.has(target)) {
            let attributes2 = {};
            attributes2[m.attributeName] = value;
            elementAttributesMap.set(target, { attributes: attributes2, timestamp: m.timestamp });
          }
          const prevAttributes = elementAttributesMap.get(target).attributes;
          const attrName = m.attributeName;
          prevAttributes[attrName] = value;
          elementAttributesMap.get(target).timestamp = m.timestamp;
        }
      } else if (m.type == "characterData") {
        const value = m.target.textContent ?? "";
        elementTextMap.set(m.target, { text: value, timestamp: m.timestamp });
      } else if (m.type == "childList") {
        m.addedNodes.forEach((c) => {
          eventMutations.push(this.generateAddEvent(c, m.target, m.timestamp));
        });
        m.removedNodes.forEach((c) => {
          let re = this.generateRemoveEvent(c, m.target, m.timestamp);
          eventMutations.push(re);
          removeRecursivelyFromElementsMap(c);
        });
      }
    }
    elementAttributesMap.forEach((e, n) => {
      let ae = this.generateAttributeMutationEvent(n, e.attributes, e.timestamp);
      eventMutations.push(ae);
    });
    elementStylesMap.forEach((e, n) => {
      eventMutations.push(this.generateStyleAttributeMutationEvent(n, e.styles, e.timestamp));
    });
    elementTextMap.forEach((e, n) => {
      eventMutations.push(this.generateTextMutationEvent(n, e.text, e.timestamp));
    });
    return eventMutations;
  }
  generateAddEvent(n, parent, timestamp) {
    let serialized = this.serializer.serialize(
      n
    );
    serialized.after = this.elId(n.nextSibling);
    serialized.before = this.elId(n.previousSibling);
    serialized.parent = this.elId(parent);
    return { ...serialized, timestamp, name: "mutation-add" };
  }
  generateAttributeMutationEvent(a, attributes2, timestamp) {
    return {
      name: "mutation-attribute",
      attributes: attributes2,
      id: this.elId(a),
      timestamp
    };
  }
  generateStyleAttributeMutationEvent(a, styles, timestamp) {
    return {
      name: "mutation-style",
      styles,
      id: this.elId(a),
      timestamp
    };
  }
  generateTextMutationEvent(t, value, timestamp) {
    return {
      name: "mutation-text",
      text: value,
      id: this.elId(t),
      timestamp
    };
  }
  generateRemoveEvent(c, parent, timestamp) {
    return {
      name: "mutation-remove",
      parent: this.elId(parent),
      id: this.elId(c),
      timestamp
    };
  }
  elId(n) {
    return this.elIdGenerator.id(n);
  }
};

// src/dom/serializer/elid.generator.ts
var ElidGenerator = class {
  constructor(elementsMap = /* @__PURE__ */ new Map(), lastId = 0) {
    this.elementsMap = elementsMap;
    this.lastId = lastId;
  }
  get lastGeneratedId() {
    return this.lastId;
  }
  id(t) {
    if (!t)
      return void 0;
    else {
      if (!this.elementsMap.has(t)) {
        this.lastId++;
        this.elementsMap.set(t, this.lastId);
      }
      return this.elementsMap.get(t);
    }
  }
  updateLastId(maxId) {
    this.lastId = maxId;
  }
};

// src/dom/serializer/web-component.serializer.ts
var WebComponentDomSerializer = class {
  constructor(elementDomSerializer) {
    this.elementDomSerializer = elementDomSerializer;
  }
  serialize(n) {
    let dsh = new DOMSerializerHelper();
    let { element, tag: tag2, attributes: attributes2 } = dsh.nodeElementTagAttributes(n);
    let w = n;
    const serialize = (c) => this.elementDomSerializer.serialize(c);
    let children = [];
    let shadowStyle = "";
    let shadowMode = "open";
    let shadowChildren = [];
    let shadow = null;
    let shadowRoot = element.shadowRoot || w._closed_mode_shadowRoot;
    let isDocumentFragment = () => {
      try {
        return shadowRoot.$$OwnerKey$$ || shadowRoot.constructor.prototype.nodeName == "#document-fragment";
      } catch (e) {
        return false;
      }
    };
    if (shadowRoot) {
      try {
        let innerStyle = [...shadowRoot.adoptedStyleSheets[0].rules].map((r) => {
          let css = dsh.getAbsoluteUrlsStylesheet(r.cssText);
          return css;
        }).join("");
        shadowStyle = innerStyle;
      } catch (e) {
      }
      shadowMode = shadowRoot.mode;
      for (let c of shadowRoot.childNodes)
        shadowChildren.push(serialize(c));
      shadow = {
        children: shadowChildren,
        mode: shadowMode,
        shadowType: isDocumentFragment() ? "document-fragment" : "shadow-dom",
        style: shadowStyle
      };
    }
    for (let c of w.childNodes)
      children.push(serialize(c));
    if (isDocumentFragment())
      shadow.documentFragment = serialize(element.shadowRoot);
    return { children, tag: tag2, attributes: attributes2, shadow, type: "web-component" };
  }
};

// src/dom/serializer/text.serializer.ts
var TextDomSerializer = class {
  serialize(n) {
    let doms = new DOMSerializerHelper();
    const parentTagName = n.parentNode && n.parentNode.tagName;
    let textContent = n.textContent ?? "";
    const isStyle = parentTagName === "STYLE" ? true : void 0;
    if (isStyle && textContent) {
      return {
        type: "css-text",
        css: doms.getAbsoluteUrlsStylesheet(textContent)
      };
    }
    if (parentTagName === "SCRIPT") {
      return {
        type: "script-text",
        script: textContent.replace(/\n/g, "\n\\\\")
      };
    }
    let type = "text";
    return {
      type,
      text: textContent || ""
    };
  }
};

// src/dom/serializer/stylesheet.serializer.ts
var StylesheetDomSerializer = class {
  serialize(n) {
    let dsh = new DOMSerializerHelper();
    let { tag: tag2, attributes: attributes2 } = dsh.nodeElementTagAttributes(n);
    let css = "";
    if (tag2 === "link") {
      return this.serializeLink(n, attributes2, dsh);
    } else if (tag2 === "style" && n.sheet && !(n.innerText || n.textContent || "").trim().length) {
      const cssText = getCssRulesString(n.sheet);
      if (cssText) {
        css = dsh.getAbsoluteUrlsStylesheet(cssText, location.href);
      }
      return { type: "style", tag: "style", attributes: attributes2, css };
    } else {
      return { type: tag2, tag: "style", attributes: attributes2, css };
    }
  }
  serializeLink(n, attributes2, dsh) {
    const stylesheet = Array.from(document.styleSheets).find((s) => {
      return s.href === n.href;
    });
    let css = "";
    const cssText = getCssRulesString(stylesheet);
    if (cssText) {
      delete attributes2.rel;
      delete attributes2.href;
      css = dsh.getAbsoluteUrlsStylesheet(cssText, stylesheet.href);
    }
    return { type: "link-stylesheet", tag: "link", attributes: attributes2, css };
  }
};
function getCssRulesString(s) {
  try {
    const rules = s.rules || s.cssRules;
    return rules ? Array.from(rules).reduce((prev, cur) => prev + getCssRuleString(cur), "") : null;
  } catch (error) {
    return null;
  }
}
function isCSSImportRule(rule) {
  return "styleSheet" in rule;
}
function getCssRuleString(rule) {
  return isCSSImportRule(rule) ? getCssRulesString(rule.styleSheet) || "" : rule.cssText;
}

// src/dom/serializer/media.serializer.ts
var MediaDomSerializer = class {
  serialize(n) {
    let dsh = new DOMSerializerHelper();
    let { tag: tag2, attributes: attributes2 } = dsh.nodeElementTagAttributes(n);
    let state = n.paused ? "pause" : "play";
    return { type: tag2, tag: tag2, attributes: attributes2, state };
  }
};

// src/dom/serializer/form.serializer.ts
var FormDomSerializer = class {
  serialize(n) {
    let dsh = new DOMSerializerHelper();
    let { tag: tag2, attributes: attributes2 } = dsh.nodeElementTagAttributes(n);
    if (tag2 === "input" || tag2 === "textarea" || tag2 === "select") {
      const value = n.value;
      if (attributes2["type"] !== "radio" && attributes2["type"] !== "checkbox" && value) {
        attributes2["value"] = value;
      } else if (n.checked) {
        attributes2["checked"] = n.checked + "";
      }
      return { type: tag2, tag: tag2, attributes: attributes2 };
    } else if (tag2 === "option") {
      const selectValue = n.parentElement;
      if (attributes2["value"] === selectValue.value) {
        attributes2["selected"] = n.selected + "";
      }
      return { type: "option", tag: tag2, attributes: attributes2 };
    } else
      return { type: tag2, tag: tag2, attributes: attributes2 };
  }
};

// src/dom/serializer/canvas.serializer.ts
var CanvasDomSerializer = class {
  serialize(n) {
    let dsh = new DOMSerializerHelper();
    let attributes2 = dsh.getElementAttributes(n);
    let dataUrl = n.toDataURL();
    return { type: "canvas", tag: "canvas", dataUrl, attributes: attributes2 };
  }
};

// src/dom/serializer/element.serializer.ts
var ElementSerializer = class {
  constructor(onNodeSerialized, win = window) {
    this.onNodeSerialized = onNodeSerialized;
    this.win = win;
  }
  serialize(n) {
    let serialized;
    let isWebComponent = n.nodeName && n.nodeName.includes("-") && n.nodeName != "#document-fragment";
    if (isWebComponent) {
      serialized = new WebComponentDomSerializer(this).serialize(n);
    } else {
      let children = [];
      for (const child of Array.from(n.childNodes)) {
        let c = this.serialize(child);
        children.push(c);
      }
      const serializedNode = this.serializeSingle(n);
      serializedNode.children = children;
      serialized = serializedNode;
    }
    if (this.onNodeSerialized)
      this.onNodeSerialized(n, serialized);
    return serialized;
  }
  serializeSingle(n) {
    switch (n.nodeType) {
      case n.DOCUMENT_NODE:
        return {
          type: "document",
          href: this.win.location.href,
          width: this.win.innerWidth,
          height: this.win.innerHeight,
          scroll: { x: this.win.scrollX, y: this.win.scrollY }
        };
      case n.DOCUMENT_TYPE_NODE:
        return {
          type: "doc-type",
          name: n.name,
          publicId: n.publicId,
          systemId: n.systemId
        };
      case n.TEXT_NODE:
        return new TextDomSerializer().serialize(n);
      case n.CDATA_SECTION_NODE:
        return {
          type: "cdata",
          textContent: ""
        };
      case n.COMMENT_NODE:
        return {
          type: "comment",
          textContent: n.textContent || ""
        };
      default:
        return this.serializeElement(n);
    }
  }
  serializeElement(n) {
    let dsh = new DOMSerializerHelper();
    let { element, tag: tag2, attributes: attributes2 } = dsh.nodeElementTagAttributes(n);
    let scroll = { x: element.scrollTop, y: element.scrollLeft };
    let json = { type: tag2, tag: tag2, scroll };
    if (tag2 === "link" || tag2 === "style") {
      json = { ...json, ...new StylesheetDomSerializer().serialize(n) };
    } else if (tag2 === "audio" || tag2 === "video") {
      json = { ...json, ...new MediaDomSerializer().serialize(n) };
    } else if (tag2 === "input" || tag2 === "textarea" || tag2 === "select" || tag2 === "option")
      json = { ...json, ...new FormDomSerializer().serialize(n) };
    else if (tag2 === "canvas")
      json = { ...json, ...new CanvasDomSerializer().serialize(n) };
    else
      json = {
        ...json,
        type: tag2,
        tag: tag2,
        attributes: attributes2
      };
    if (json.tag == "img") {
      let img = n;
      if (img.width && img.height) {
        json.width = img.width;
        json.height = img.height;
      } else {
        img.onload = () => {
          json.width = img.width;
          json.height = img.height;
        };
      }
    }
    return json;
  }
};

// src/dom/dom.monitor.ts
var DomMonitor = class {
  constructor(options = { intervalTimeForFullEvent: -1 }) {
    this.options = options;
  }
  mutationObserver;
  fullEventFireIntervalId;
  elementsMap = /* @__PURE__ */ new Map();
  enable() {
    this.mutationObserver = new DomFrameMutationsMonitor((frameMutations) => {
      let mutations = new MutationSerializer(this.elementsMap, elid, serializer).serialize(
        frameMutations
      );
      let e = {
        mutations,
        timestamp: new Date().getTime(),
        type: "dom",
        name: "dom-change"
      };
      blevent2.dom.change(e);
    });
    let elid = new ElidGenerator(this.elementsMap);
    let serializer = new ElementSerializer((n, j) => {
      let sr = n.shadowRoot || n._closed_mode_shadowRoot;
      if (sr) {
        this.mutationObserver.observe(sr);
      }
      j.id = elid.id(n);
    });
    blevent2.dom.map_created({ map: this.elementsMap, serializer });
    if (this.options.intervalTimeForFullEvent > 0)
      this.fullEventFireIntervalId = setInterval(() => {
        this.fireFullDomEvent(serializer);
      }, this.options.intervalTimeForFullEvent);
    this.fireFullDomEvent(serializer);
    this.mutationObserver.observe(document);
    let webComponents = [...document.querySelectorAll("*")].filter(
      (x2) => x2.tagName.indexOf("-") >= 0
    );
    const pageHasWebComponents = webComponents.length > 0;
    if (pageHasWebComponents) {
      for (let w of webComponents) {
        let sr = w.shadowRoot || w._closed_mode_shadowRoot;
        if (sr)
          this.mutationObserver.observe(sr);
      }
    }
  }
  disable() {
    this.mutationObserver.disable();
    if (this.fullEventFireIntervalId)
      clearInterval(this.fullEventFireIntervalId);
  }
  fireFullDomEvent(serializer) {
    let snapshot = serializer.serialize(document);
    const fullEvent = { full: snapshot };
    blevent2.dom.full(fullEvent);
    return snapshot;
  }
  takeDomScreenshot() {
    return this.fireFullDomEvent(new ElementSerializer());
  }
};

// src/dom/css.monitor.ts
var CssMonitor = class {
  insertOriginal;
  removeOriginal;
  enable() {
    this.insertOriginal = observeMethod(
      CSSStyleSheet.prototype,
      "insertRule",
      function(rule, index) {
        blevent2.dom.css_add({ rule, target: this.ownerNode, index });
      }
    );
    this.removeOriginal = observeMethod(
      CSSStyleSheet.prototype,
      "deleteRule",
      function(index) {
        blevent2.dom.css_remove({ target: this.ownerNode, index });
      }
    );
  }
  disable() {
    this.insertOriginal();
    this.removeOriginal();
  }
};

// src/dom/media.monitor.ts
var MediaMonitor = class {
  disableMonitoring;
  enable() {
    const handlers = [
      on("play", (e) => {
        blevent2.media.play({ target: e.target });
      }),
      on("pause", (e) => {
        blevent2.media.pause({ target: e.target });
      })
    ];
    this.disableMonitoring = () => {
      handlers.forEach((h) => h());
    };
  }
  disable() {
    this.disableMonitoring();
  }
};

// src/dom/force-web-components-serialization.patch.ts
var ForceWebComponentsSerializationPatch = class {
  apply() {
    const { attachShadow } = Element.prototype;
    Element.prototype.attachShadow = function() {
      let sh = attachShadow.apply(this, arguments);
      this._closed_mode_shadowRoot = sh;
      return sh;
    };
  }
};

// src/monitors/wheel.monitor.ts
var WheelMonitor = class {
  disableWheel = () => {
  };
  enable() {
    const updatePosition = throttle((evt) => {
      this.manageWheelEvent(evt);
    }, 50);
    this.disableWheel = on("wheel", updatePosition);
  }
  manageWheelEvent(evt) {
    let deltaX = evt.deltaX;
    let deltaY = evt.deltaY;
    let data = {
      deltaX,
      deltaY,
      target: evt.target,
      currentTarget: evt.currentTarget
    };
    blevent2.mouse.wheel(data);
  }
  disable() {
    this.disableWheel();
  }
};

// src/monitors/session.monitor.ts
function targetToSelectors(e) {
  const selector = (e2) => {
    try {
      return new ElementSelectorFinder().findUniqueSelector(e2);
    } catch {
      return "";
    }
  };
  const targetSelector = e.target ? selector(e.target) : "";
  const currentTargetSelector = e.currentTarget ? selector(e.currentTarget) : "";
  const { target, currentTarget, ...evt } = e;
  return { ...evt, targetSelector, currentTargetSelector };
}
new ForceWebComponentsSerializationPatch().apply();
var SessionMonitor = class {
  sendTo;
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
    new WindowResizeMonitor()
  ];
  delayedMonitors = [new DomMonitor(), new CssMonitor(), new MediaMonitor()];
  httpMonitor = new HttpMonitor();
  constructor(sendTo) {
    this.sendTo = sendTo;
    this.setupDispatchers();
  }
  enable() {
    this.httpMonitor.enable();
    this.monitors.forEach((m) => m.enable());
    setTimeout(() => {
      this.delayedMonitors.forEach((m) => m.enable());
    }, 1e3);
  }
  disable() {
    this.httpMonitor.disable();
    this.monitors.forEach((m) => m.disable());
    this.delayedMonitors.forEach((m) => m.disable());
  }
  setupDispatchers() {
    const sendEventWithTargetToExtension = (event) => this.sendTo(targetToSelectors(event));
    const sendEventWithSerializedTargetToExtension = async (event) => {
      const rect = await getElementRect(event.target);
      const attributes2 = getElementAttributes(event.target);
      const { target, currentTarget, ...evt } = event;
      this.sendTo({
        ...evt,
        target: {
          rect,
          attributes: attributes2,
          tag: event.target.tagName,
          innerText: event.target.innerText ?? ""
        }
      });
    };
    Object.keys(blevent2.mouse).forEach((me) => {
      if (me != "scroll")
        blevent2.mouse[me].on(sendEventWithSerializedTargetToExtension);
      else
        blevent2.mouse[me].on(sendEventWithTargetToExtension);
    });
    blevent2.media.play.on(sendEventWithSerializedTargetToExtension);
    blevent2.media.pause.on(sendEventWithSerializedTargetToExtension);
    blevent2.dom.change.on(this.sendTo);
    blevent2.dom.full.on(this.sendTo);
    blevent2.dom.css_add.on(sendEventWithSerializedTargetToExtension);
    blevent2.dom.css_remove.on(sendEventWithSerializedTargetToExtension);
    blevent2.cookie.data.on(this.sendTo);
    Object.keys(blevent2.keyboard).forEach((ke) => {
      blevent2.keyboard[ke].on(sendEventWithSerializedTargetToExtension);
    });
    Object.keys(blevent2.page).forEach((me) => blevent2.page[me].on(this.sendTo));
    Object.keys(blevent2.window).forEach((me) => blevent2.window[me].on(this.sendTo));
    Object.keys(blevent2.storage).forEach((me) => blevent2.storage[me].on(this.sendTo));
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
    blevent2.http.error.on(errorHandler);
    blevent2.http.abort.on(errorHandler);
    blevent2.http.after_response.on((e) => {
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
};
