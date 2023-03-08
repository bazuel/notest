export function observeMethod<T>(target: T, method: keyof T, newMethod) {
  const original = target[method] as any;
  const wrapper = function (this: any, ...args) {
    let options = {
      skipThrow: false,
      override: null,
      onError: (error) => {},
      beforeReturn: (result) => {
        return result;
      },
      executeOriginal: () => {
        return original.apply(this, args);
      },
    };
    newMethod.apply(this as any, [...args, options]);
    if (options.override) {
      // @ts-ignore
      return options.override(args);
    } else {
      try {
        let rv = options.executeOriginal();
        return options.beforeReturn(rv);
      } catch (e) {
        options.onError(e);
        if (!options.skipThrow) throw e;
      }
    }
  };
  target[method] = wrapper as any;
  return function () {
    target[method] = original;
  };
}

export interface MethodObserverOptions {
  skipThrow: boolean;
  onError: (error) => void;
  beforeReturn: <T>(result: T | void) => T | void;
  executeOriginal: <T>() => T | void;
  override: <T>(...args) => T | void;
}
