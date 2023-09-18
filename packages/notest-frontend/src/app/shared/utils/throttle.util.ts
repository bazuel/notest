/**
 * From https://github.com/github/mini-throttle/blob/main/index.ts
 */

export interface ThrottleOptions {
  /**
   * Fire immediately on the first call.
   */
  start?: boolean;
  /**
   * Fire as soon as `wait` has passed.
   */
  middle?: boolean;
  /**
   * Cancel after the first successful call.
   */
  once?: boolean;
}

interface Throttler<T extends unknown[]> {
  (...args: T): void;
  cancel(): void;
}

export function throttle<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait = 0,
  { start = true, middle = true, once = false }: ThrottleOptions = {}
): Throttler<T> {
  let last = 0;
  let timer: ReturnType<typeof setTimeout>;
  let cancelled = false;
  function fn(this: unknown, ...args: T) {
    if (cancelled) return;
    const delta = Date.now() - last;
    last = Date.now();
    if (start) {
      start = false;
      callback.apply(this, args);
      if (once) fn.cancel();
    } else if ((middle && delta < wait) || !middle) {
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          last = Date.now();
          callback.apply(this, args);
          if (once) fn.cancel();
        },
        !middle ? wait : wait - delta
      );
    }
  }
  fn.cancel = () => {
    clearTimeout(timer);
    cancelled = true;
  };
  return fn;
}

export function debounce<T extends unknown[]>(
  callback: (...args: T) => unknown,
  wait = 0,
  { start = false, middle = false, once = false }: ThrottleOptions = {}
): Throttler<T> {
  return throttle(callback, wait, { start, middle, once });
}

export function Debounce(milliseconds: number = 250): any {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = debounce(originalMethod, milliseconds);
    return descriptor;
  };
}

export function Throttle(milliseconds: number = 250): any {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = throttle(originalMethod, milliseconds);
    return descriptor;
  };
}
