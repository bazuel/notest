import { Component, Input, OnInit } from '@angular/core';
import {
  BLCookieEvent,
  BLSessionEvent,
  BLStorageEvent,
  byTimestamp,
  TabIndex
} from '@notest/common';

interface DevtoolStorageItem {
  key: string;
  value: any;
  timestamp: number;
  tab: number;
  show: boolean;
  preview: string;
}

@Component({
  selector: 'bl-devtool-storage',
  templateUrl: './devtool-storage.component.html',
  styleUrls: ['./devtool-storage.component.scss']
})
export class DevtoolStorageComponent implements OnInit {
  @Input()
  type!: 'local' | 'session' | 'cookie';

  @Input() events: BLSessionEvent[] = [];

  rendered: DevtoolStorageItem[] = [];

  ngOnInit(): void {
    this.updateRendered();
  }

  ngOnChanges(): void {
    this.updateRendered();
  }

  private async updateRendered() {
    this.rendered = [];
    const tabs = this.events.reduce((acc: number[], e: any & { tab: number }) => {
      if (!acc.includes(e.tab)) acc.push(e.tab);
      return acc;
    }, [] as number[]);
    let call = () => this.events.filter((e) => e.name == 'local-full' || e.name == 'local-update');
    if (this.type == 'session')
      call = () =>
        this.events.filter((e) => e.name == 'session-full' || e.name == 'session-update');
    else if (this.type == 'cookie')
      call = () => this.events.filter((e) => e.name == 'cookie-details')[0]['details'];

    let tabIndex = new TabIndex();
    for (let t of tabs) {
      let data = call();
      console.log('data: ', data);
      if (this.type == 'cookie')
        this.rendered = [
          ...this.rendered,
          ...this.toCookiesStorageData(data as any[], tabIndex.index(t))
        ];
      else
        this.rendered = [
          ...this.rendered,
          ...this.toDevtoolStorageData(data as any[], tabIndex.index(t))
        ];
    }
    console.log('rendered: ', this.rendered);
  }

  private toDevtoolStorageData(ls: BLStorageEvent[], tab: number): DevtoolStorageItem[] {
    let sd: DevtoolStorageItem[] = [];
    for (let l of ls) {
      for (let k in l.storage) {
        sd.push({
          key: k,
          value: l.storage[k],
          timestamp: l.timestamp,
          tab,
          show: false,
          preview: (l.storage[k] ?? '').substr(0, 30)
        });
      }
    }
    return sd.sort(byTimestamp);
  }

  private toCookiesStorageData(cs: BLCookieEvent[], tab: number) {
    console.log('cs: ', cs);
    let sd: DevtoolStorageItem[] = [];
    for (let c of cs) {
      // const cookies = this.toCookieJson(l.cookie);
      sd.push({
        key: c.name,
        value: c['value'],
        timestamp: c.timestamp,
        tab,
        show: false,
        preview: (c['value'] ?? '').substr(0, 30)
      });
    }
    return sd.sort(byTimestamp);
  }

  private toCookieJson(cookieString: string) {
    console.log('cookieString: ', cookieString);
    if (!cookieString) return {};
    return cookieString.split(/; */).reduce((obj, str) => {
      if (str === '') return obj;
      const eq = str.indexOf('=');
      const key = eq > 0 ? str.slice(0, eq) : str;
      let val = eq > 0 ? str.slice(eq + 1) : null;
      if (val != null)
        try {
          val = decodeURIComponent(val);
        } catch (ex) {
          /* pass */
        }
      obj[key] = val;
      return obj;
    }, {});
  }
}
