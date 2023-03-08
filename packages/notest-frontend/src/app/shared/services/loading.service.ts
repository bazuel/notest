import { Injectable } from '@angular/core';

/**
 *
 * Shows a full screen loading before the ngOnInit method and hides it after the ngOnInit execution.
 * Internally it uses the LoadingService and it bahaves like the following code:
 * <br>1) injects the LoadingService into the constructor
 * <br>2) calls this.loadingService.setLoading() as the first line of the ngOnInit
 * <br>3) calls this.loadingService.unsetLoading() as the last line of the ngOnInit
 *
 *
 * @constructor
 */
export function ShowFullScreenLoading() {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      const ls: LoadingService = (ShowFullScreenLoading as any).serviceInstance;
      if (!ls) new LoadingService(); // loading service was never injected and so it is not yet initialized
      ls.setLoading();
      let rv;
      try {
        const prv = childFunction.apply(this, args);
        rv = await Promise.resolve(prv);
        ls.unsetLoading();
        return rv;
      } catch (e) {
        ls.unsetLoading();
        throw e;
      }
    };
    return descriptor;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private showloading!: boolean;

  constructor() {
    (ShowFullScreenLoading as any).serviceInstance = this;
  }

  isLoading(): boolean {
    return this.showloading;
  }

  setLoading(): void {
    setTimeout(() => (this.showloading = true));
  }

  unsetLoading(): void {
    setTimeout(() => (this.showloading = false));
  }
}
