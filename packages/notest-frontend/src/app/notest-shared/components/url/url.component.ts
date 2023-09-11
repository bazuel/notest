import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bl-url',
  templateUrl: './url.component.html',
  styleUrls: ['./url.component.scss']
})
export class UrlComponent implements OnInit {
  @Input()
  url!: string;

  u: {
    base?: string;
    path?: string;
    query?: string;
    hash?: string;
    hashQuery?: string;
  } = {};
  @Input()
  full = false;

  constructor() {}

  ngOnInit(): void {
    try {
      const u = new URL(this.url);
      const path = u.pathname;
      const query = u.search;
      const rawHash = u.hash;
      let hash = '';
      let hashQuery = '';
      if (rawHash.length > 0) {
        let hashParts = rawHash.split('?');
        hash = hashParts[0];
        hashQuery = hashParts[1] ? '?' + hashParts[1] : '';
      }
      const host = u.host;
      const protocol = u.protocol;
      const port = u.port == '80' || !u.port ? '' : ':' + u.port;
      const base = `${protocol}//${host}${port}`;
      this.u = { base, path, query, hash, hashQuery };
    } catch {
      this.u = { base: '', path: this.url, query: '', hash: '', hashQuery: '' };
    }
  }
}
