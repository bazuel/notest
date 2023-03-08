import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { BLSessionEvent, NTEvent } from '@notest/common';

@Component({
  selector: 'nt-session-comparator',
  templateUrl: './session-comparator.component.html',
  styleUrls: ['./session-comparator.component.scss']
})
export class SessionComparatorComponent implements OnInit {
  private session1: BLSessionEvent[] = [];
  private session2: BLSessionEvent[] = [];
  private ready = false;
  constructor(private urlParamsService: UrlParamsService, private sessionService: SessionService) {}

  async ngOnInit() {
    this.session1 = await this.sessionService.getEventsByReference(
      this.urlParamsService.get('ref1')
    );
    this.session2 = await this.sessionService.getEventsByReference(
      this.urlParamsService.get('ref2')
    );
    this.ready = true;
  }
}
