import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  BLEvent,
  BLHTTPResponseEvent,
  BLSessionEvent,
  byTimestamp,
  TabIndex
} from '@notest/common';
import { CurrentTimestampService } from '../../../services/current-timestamp.service';
import { SessionUrlParamsService } from '../../../services/session-url-params.service';

type AugmentedSidRequest = BLHTTPResponseEvent & {
  preview: string;
  show: boolean;
  tab: number;
  loading: boolean;
  data?;
};
type InfoBeforeRequest = {
  index: number;
  sid: number;
  url: string;
  timestamp: number;
  tab: number;
  cursor?: boolean;
  click?: boolean;
  address?: boolean;
};

@Component({
  selector: 'bl-devtool-network',
  templateUrl: './devtool-network.component.html',
  styleUrls: ['./devtool-network.component.scss']
})
export class DevtoolNetworkComponent implements OnInit {
  @ViewChild('table', { static: false })
  tableRef!: ElementRef<HTMLTableElement>;

  @Input() events: BLSessionEvent[] = [];

  @Output()
  timestampChange = new EventEmitter<number>();

  filteredRequests: {
    request?: AugmentedSidRequest;
    info?: InfoBeforeRequest;
    timestamp: number;
  }[] = [];
  requests: AugmentedSidRequest[] = [];
  loading = true;
  filters = { path: '', status: '', method: '' };
  private infos: InfoBeforeRequest[] = [];
  highlight: boolean[] = [];

  constructor(private params: SessionUrlParamsService, private ts: CurrentTimestampService) {
    ts.onChange((currentTimestamp) => {
      if (this.filteredRequests.length > 1 && this.tableRef) {
        let rows = this.tableRef.nativeElement.querySelectorAll('tr');
        let r = this.filteredRequests.find((r) => r.timestamp > currentTimestamp)!;
        let index = this.filteredRequests.indexOf(r);
        rows[index + 1].scrollIntoView();
      }
      this.filteredRequests.forEach((r, i) => {
        this.highlight[i] = ts.isClose(r.timestamp);
      });
    });
  }

  async ngOnInit() {
    let { sid, tabs, from, to } = await this.params.get();
    let tabIndex = new TabIndex().index.bind(new TabIndex());
    const tabIndexes = tabs.map((t) => ({
      tab: t,
      index: tabIndex(t)
    }));
    const isRequest = (e: BLEvent): e is BLHTTPResponseEvent => e.type == 'http';
    this.requests = this.events.filter(isRequest).map((r: BLHTTPResponseEvent) => {
      return {
        ...r,
        tab: tabIndexes.find((ti) => ti.tab == r.tab)!.index,
        preview: JSON.stringify({
          headers: r.request.headers,
          body: r.request.body,
          query: this.queryParams(r.request.url)
        }),
        loading: false,
        show: false
      };
    });
    const isClickAddresses = (e: BLEvent): e is BLSessionEvent =>
      ['click', 'address'].includes(e.name);
    let clickAddresses = this.events.filter(isClickAddresses);
    let infos: InfoBeforeRequest[] = [
      ...clickAddresses.map((i) => {
        let info: InfoBeforeRequest = {
          timestamp: i.timestamp,
          tab: i.tab,
          url: i.url,
          sid: i.sid,
          index: tabIndex(i.tab)
        };
        if (i.name == 'click') info.click = true;
        if (i.name == 'address') info.address = true;
        return info;
      })
    ];

    this.infos = [...infos];
    this.updateFilteredRequests();
    this.loading = false;
  }

  updateFilteredRequests() {
    let pr = new RegExp('', 'gi');
    let sr = new RegExp('', 'gi');
    let mr = new RegExp('', 'gi');
    try {
      pr = new RegExp(this.filters.path, 'gi');
    } catch {}
    try {
      sr = new RegExp(this.filters.status, 'gi');
    } catch {}
    try {
      mr = new RegExp(this.filters.method, 'gi');
    } catch {}

    let requestsToInclude = [...this.requests].filter((r) => {
      let include = true;
      if (this.filters.path) {
        include = include && pr.test(r.request.url);
      }
      if (this.filters.status) {
        include = include && sr.test(r.status + '');
      }
      if (this.filters.method) {
        include = include && mr.test(r.request.method);
      }

      return include;
    });

    //include infos and sort
    this.filteredRequests = [
      ...requestsToInclude.map((r) => ({ request: r, timestamp: r.timestamp })),
      ...this.infos.map((r) => ({ info: r, timestamp: r.timestamp }))
    ].sort(byTimestamp);
  }

  queryParams(url) {
    try {
      let query = new URL(url).search;
      return query
        ? (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params, param) => {
            let [key, value] = param.split('=');
            params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            return params;
          }, {})
        : {};
    } catch (e) {
      return {};
    }
  }

  async onRequestClick(r: AugmentedSidRequest) {
    r.show = !r.show;
    r.loading = true;
    r.data = this.requests.filter(
      (r) => r.timestamp == r.timestamp && r.sid == r.sid && r.request.path == r.request.path
    );
    r.loading = false;
    this.timestampChange.emit(r.timestamp);
  }

  onInfoClick(info: InfoBeforeRequest) {
    console.log('info: ', info);
    this.timestampChange.emit(info.timestamp);
  }
}
