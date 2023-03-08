import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

(window as any).svelteLogStores = window.location.href.startsWith(
  "http://localhost:3000"
);

export type EnhancedWritable<X = any> = Writable<X> & {
  update: (action: Partial<X> | ((prevStore: X) => Partial<X>)) => void;
};

export function loggedWritable<T>(initialStore: T) {
  const { writable, update } = createStore<T>(initialStore);
  writable.update = (newState: Partial<T> | ((prevStore: T) => Partial<T>)) =>
    update(writable, newState as any);
  return writable as EnhancedWritable<T>;
}

function isFunction(functionToCheck) {
  var getType = {};
  return (
    functionToCheck &&
    getType.toString.call(functionToCheck) === "[object Function]"
  );
}

function isNode(o) {
  return typeof Node === "object"
    ? o instanceof Node
    : o &&
        typeof o === "object" &&
        typeof o.nodeType === "number" &&
        typeof o.nodeName === "string";
}

function isElement(o) {
  return typeof HTMLElement === "object"
    ? o instanceof HTMLElement //DOM2
    : o &&
        typeof o === "object" &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === "string";
}

function serializer(replacer?, cycleReplacer?) {
  const stack: any[] = [],
    keys: any[] = [];

  if (cycleReplacer == null)
    cycleReplacer = function (key, value) {
      if (stack[0] === value) return "[Circular ~]";
      return (
        "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
      );
    };

  return function (key, value) {
    if (stack.length > 0) {
      const thisPos = stack.indexOf(this);
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
    } else stack.push(value);

    if (replacer == null) {
      return value;
    } else {
      return replacer.call(this, key, value);
    }
  };
}

const logActions = () => (window as any).svelteLogStores;
const stores = new WeakMap();

function update<T>(store: Writable<T>, newPartialStore: Partial<T>);
function update<T>(store: Writable<T>, action: (prevStore: T) => Partial<T>);
function update<T>(
  store: Writable<T>,
  action: Partial<T> | ((prevStore: T) => Partial<T>)
) {
  const prevStore = stores.get(store);

  let ps;
  if (logActions()) ps = JSON.parse(JSON.stringify(prevStore, serializer()));
  const result = isFunction(action)
    ? (action as (prevStore: T) => Partial<T>)(prevStore)
    : (action as Partial<T>);
  const ns = {
    ...prevStore,
    ...result,
  };
  if (logActions()) {
    const err = new Error();
    const stack = err.stack;
    const stackInfo = stack.split("at ")[3].split(" ");
    const functionName = stackInfo[0];
    const functionLink = stackInfo[1];
    log(functionName, functionLink, result, ps, ns);
  }
  store.set(ns);
}

export function createStore<T>(initialStore: T) {
  let prevStore: T = initialStore;
  const writableStore = writable<T>(initialStore);
  stores.set(writableStore, prevStore);
  writableStore.subscribe((s) => {
    prevStore = s;
    stores.set(writableStore, prevStore);
  });
  return { store: prevStore, writable: writableStore, update };
}

function log<T>(
  functionName: string,
  functionLink: string,
  newPartial: Partial<T>,
  prevState: T,
  nextState: T
) {
  console.groupCollapsed(functionName, newPartial, functionLink);
  console.log("PREV STATE", prevState);
  console.log("NEXT STATE", nextState);
  (console as any).trace();
  console.groupEnd();
}
