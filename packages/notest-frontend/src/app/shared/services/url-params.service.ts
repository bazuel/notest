import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UrlParamsService {
  get<T>(key: keyof T):string | undefined {
    return (this.extractQueryParams() as T)[key] as unknown as (string | undefined);
  }

  extractQueryParams(queryString = window.location.search) {
    const qs = ((a: any) => {
      if (a === '') return {};
      const b = {};
      for (let i = 0; i < a.length; ++i) {
        const p = a[i].split('=', 2);
        if (p.length == 1) b[p[0]] = '';
        else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
      }
      return b;
    })(queryString.substr(1).split('&'));
    return qs;
  }
}
