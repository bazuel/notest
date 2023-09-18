import { Component, Input } from '@angular/core';
import { BLSessionEvent, BLSocketEvent } from '@notest/common';

@Component({
  selector: 'nt-devtool-socket',
  templateUrl: './devtool-socket.component.html',
  styleUrls: ['./devtool-socket.component.scss']
})
export class DevtoolSocketComponent {
  @Input() events: BLSessionEvent[] = [];

  requests: BLSocketEvent[] = [];
  selectedRequest?: BLSocketEvent;

  ngOnInit() {
    console.log('this.events: ', this.events);
    const socketEventsFilter = (e: BLSessionEvent): e is BLSocketEvent =>
      e.name === 'open' || e.name === 'message' || e.name === 'close' || e.name === 'error';
    this.requests = this.events.filter(socketEventsFilter);
    // this.requests = this.mapSocketEventToRequests(this.requests);
    console.log('this.requests: ', this.requests);
  }

  onRequestClick(r: BLSocketEvent) {
    this.selectedRequest = r;
  }

  private mapSocketEventToRequests(r: BLSocketEvent[]) {
    const mapStrategy = {
      open: (e: BLSocketEvent) => ({ url: e.url, type: e.type, timestamp: e.timestamp })
    };
    const mapper = (e: BLSocketEvent) => {};
    return;
  }
}
