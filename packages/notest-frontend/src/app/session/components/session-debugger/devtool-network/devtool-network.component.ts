import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BLHTTPResponseEvent, BLSessionEvent } from '@notest/common';

type ParsedRequest = BLHTTPResponseEvent & {
  preview: string;
  parsedQuery: { [p: string]: Record<string, string> };
};

@Component({
  selector: 'nt-devtool-network',
  templateUrl: './devtool-network.component.html',
  styleUrls: ['./devtool-network.component.scss']
})
export class DevtoolNetworkComponent implements OnInit {
  @Input() events: BLSessionEvent[] = [];

  @Output() timestampChange = new EventEmitter<number>();

  requests: ParsedRequest[] = [];

  filters: {
    path?: string;
    status?: string;
    method?: string;
  } = {};
  selectedRequest?: ParsedRequest;
  filteredRequests!: ParsedRequest[];

  async ngOnInit() {
    await this.updateRange();
  }

  private async updateRange() {
    const isHttpRequest = (e: BLSessionEvent): e is BLHTTPResponseEvent =>
      e.name === 'after-response';
    this.requests = this.events.filter(isHttpRequest).map((r: BLHTTPResponseEvent) => {
      return {
        ...r,
        parsedQuery: {
          [new URL(r.request.url).pathname]: this.queryParams(r.request.url)
        },
        request: {
          ...r.request,
          path: new URL(r.request.url).pathname
        },
        preview: JSON.stringify({
          headers: r.request.headers,
          body: r.request.body,
          query: this.queryParams(r.request.url)
        })
      };
    });
    this.filteredRequests = this.requests;
  }

  queryParams(url: string): Record<string, string> {
    try {
      const query = url.split('?')[1] || '';
      if (!query) return {};
      const params = new URLSearchParams(query);
      const entries = params.entries();
      const result: Record<string, string> = {};
      for (const [key, value] of entries) result[key] = value;
      return result;
    } catch {
      return {};
    }
  }

  async onRequestClick(r: ParsedRequest) {
    if (this.selectedRequest === r) this.selectedRequest = undefined;
    else this.selectedRequest = r;
  }

  updateFilteredRequests() {
    let pr = new RegExp(this.filters.path || '', 'gi');
    let sr = new RegExp(this.filters.status || '', 'gi');
    let mr = new RegExp(this.filters.method || '', 'gi');

    this.filteredRequests = this.requests.filter((r) => {
      let include = true;
      pr.lastIndex = 0;
      sr.lastIndex = 0;
      mr.lastIndex = 0;
      include = include && pr.test(r.request.path);
      include = include && sr.test(r.status.toString());
      include = include && mr.test(r.request.method);
      return include;
    });
  }
}
