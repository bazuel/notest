import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import {BLSessionEvent, NTEvent, NTSession} from '@notest/common';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';
import {Router} from "@angular/router";

@Component({
  selector: 'nt-session-debugger',
  templateUrl: './session-debugger.component.html',
  styleUrls: ['./session-debugger.component.scss']
})
export class SessionDebuggerComponent implements OnInit {
  private reference!: string;
  script?: string;
  eventList: BLSessionEvent[] = [];
  session!: NTSession;
  events: NTEvent[] = [];
  ready = false;
  generatingScript = false;

  constructor(private sessionService: SessionService, private urlParamsService: UrlParamsService, private router: Router) {}

  @ShowFullScreenLoading()
  async ngOnInit() {
    this.reference = this.urlParamsService.get('reference')!;
    this.eventList = await this.sessionService.getEventsByReference(this.reference);
    this.session = await this.sessionService.getSessionByReference(this.reference);
    this.ready = true;
    this.generatingScript = false;
    console.log('ref: ', this.reference);
    console.log('session: ', this.eventList);
  }

  async getSessionTest() {
    this.generatingScript = true;
    this.script = await this.sessionService.getSessionTest(this.reference);
  }

  goTo() {
    const previewLink = this.router.url.replace('debugger','preview');
    this.router.navigateByUrl(previewLink);
  }
}
