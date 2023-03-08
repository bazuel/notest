import { Component, OnInit } from '@angular/core';

/**
 *
 * Notify the user of some success or error result
 * If an exception is thrown, onErrorMessage will be shown or the error message field will be shown when onErrorMessage is not provided.
 *
 * If success, the onSuccessMessage parameter will be shown
 *
 *
 * @param onSuccessMessage
 * @param onErrorMessage
 * @constructor
 */
export function ShowNotification(onSuccessMessage?: string, onErrorMessage?: string) {
  return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
    const childFunction = descriptor.value;
    descriptor.value = async function (this: any, ...args: any[]) {
      const notificationService: NotificationService = (ShowNotification as any).serviceInstance;
      if (!notificationService) new NotificationService(); // loading service was never injected and so it is not yet initialized
      try {
        const prv = childFunction.apply(this, args);
        const rv = await Promise.resolve(prv);
        notificationService.success(onSuccessMessage ?? (rv ? rv.message : ''));
        return rv;
      } catch (e) {
        notificationService.error(onErrorMessage ?? (e as any));
      }
    };
    return descriptor;
  };
}

export class NotificationService {
  notifications: NotificationData[] = [];

  constructor(private labels: { [key: string]: string } = {}) {
    (ShowNotification as any).serviceInstance = this;
  }

  async action<T>(action: () => Promise<T>, success: string, error?: string) {
    try {
      const result = await action();
      this.success(success);
      return result;
    } catch (e: any) {
      console.error(e);
      this.error(error || e.message);
      // @ts-ignore
      return;
    }
  }

  success(message: string, timeout = 2500) {
    this.add({ message, type: 'success' }, timeout);
  }

  error(error: string, timeout = 2500) {
    this.add({ message: error, type: 'error' }, timeout);
  }

  warning(message: string, timeout = 2500) {
    this.add({ message, type: 'warning' }, timeout);
  }

  add(n: NotificationData, timeout = 2500) {
    this.notifications.push(n);
    setTimeout(() => {
      this.notifications.splice(0, 1);
    }, timeout);
  }

  remove(index: number) {
    this.notifications.splice(index, 1);
  }

  labeledError(e, error = '') {
    console.error(e);
    const message = error || this.labeled(e.error ?? e.message) || 'Errore';
    this.error(message);
  }

  private labeled(key: string, data = {}) {
    let r: string = this.labels[key];
    if (!r) {
      console.log('could not find token ' + r);
      r = key;
    }

    const hasData = Object.keys(data).length > 0;
    if (hasData) {
      for (const k in data) {
        r = r.split(`$${k}`).join(data[k]);
      }
    }
    return r;
  }
}

@Component({
  selector: 'nt-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: NotificationData[] = this.notification.notifications;

  constructor(private notification: NotificationService) {}

  ngOnInit(): void {}

  close(index: number) {
    this.notification.remove(index);
  }
}

export interface NotificationData {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string;
  title?: string;
}
