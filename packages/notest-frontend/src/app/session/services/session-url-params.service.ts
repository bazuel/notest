import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export type SessionUrlParams = {
  from: number;
  tabs: number[];
  to: number;
  sid: number;
  timestamp?: number;
  domain: string;
};

@Injectable({
  providedIn: 'root'
})
export class SessionUrlParamsService {
  private params!: SessionUrlParams;

  constructor(activated: ActivatedRoute) {
    activated.queryParams.subscribe(async (params) => {
      let sup: SessionUrlParams = {
        from: +params['from'],
        to: +params['to'],
        sid: +params['sid'],
        timestamp: +params['timestamp'],
        tabs: params['tabs']?.split(',').map((t) => +t) || [1],
        domain: params['domain']
      };
      this.params = sup;
    });
  }

  async get() {
    while (!this.params) await new Promise((r) => setTimeout(r, 10));
    return this.params;
  }
}
