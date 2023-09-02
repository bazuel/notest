import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { BLSessionEvent, debounce, NTEvent, NTSession } from '@notest/common';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';
import { Router } from '@angular/router';

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

  showScript = false;

  constructor(
    private sessionService: SessionService,
    private urlParamsService: UrlParamsService,
    private router: Router
  ) {}

  @ShowFullScreenLoading()
  async ngOnInit() {
    this.reference = this.urlParamsService.get('reference')!;
    this.eventList = await this.sessionService.getEventsByReference(this.reference);
    this.session = await this.sessionService.getSessionByReference(this.reference);
    this.script = this.session.info.e2eScript;
    this.ready = true;
    this.generatingScript = false;
    console.log('ref: ', this.reference);
    console.log('session: ', this.session);
  }

  async getSessionTest() {
    this.generatingScript = true;
    this.session.info.e2eScript = await this.sessionService.getSessionTest(this.reference);
    this.showScript = true;
    this.updateSession();
  }

  goTo() {
    const previewLink = this.router.url.replace('debugger', 'preview');
    this.router.navigateByUrl(previewLink);
  }

  async updateSession() {
    await this.sessionService.updateSessionInfo(this.session);
  }
  debouncedSaveSession = debounce(async () => this.updateSession(), 1000);
}
