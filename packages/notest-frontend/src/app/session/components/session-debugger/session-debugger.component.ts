import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { BLSessionEvent, copyToClipboard, debounce, NTEvent, NTSession } from '@notest/common';
import { Router } from '@angular/router';
import {
  JsonAction,
  JsonActionData,
  JsonViewerService
} from '../../../shared/components/json-viewer/json-viewer.service';
import { showCopiedTooltip } from '../../../shared/directives/copy.directive';

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

  jsonTemplate?: JsonActionData;
  toolSelected?: 'devtool' | 'e2e' = 'devtool';

  showScript = false;
  originalReference!: string;

  constructor(
    private sessionService: SessionService,
    private urlParamsService: UrlParamsService,
    private router: Router,
    private jsonViewerService: JsonViewerService
  ) {
    this.configureJsonViewer();
  }

  private configureJsonViewer() {
    let actions: JsonAction[] = [
      {
        icon: 'magic',
        tooltip: 'Open templates',
        handler: (data) => {
          console.log('data: ', data);
          this.jsonTemplate = data;
        }
      },
      {
        icon: 'console',
        tooltip: 'Log to console',
        handler: (data) => {
          console.log(data.key ?? 'root', data.json);
        }
      },
      {
        icon: 'copy',
        tooltip: 'Copy to clipboard',
        handler: (data) => {
          console.log('data: ', data);
          copyToClipboard(JSON.stringify(data.json, null, '  '));
          if (data.event.currentTarget) showCopiedTooltip(data.event.currentTarget);
        }
      },
      {
        icon: 'sort',
        tooltip: 'Sort alphabetically',
        handler: (data) => {
          data.rows.sort((r1, r2) => (r1.key || '').localeCompare(r2.key));
        }
      }
    ];
    this.jsonViewerService.updateActions(actions);
  }

  async ngOnInit() {
    this.reference = this.urlParamsService.get('reference')!;
    this.originalReference = this.urlParamsService.get('originalReference') || this.reference;
    console.log('ref: ', this.reference);
    this.sessionService
      .getEventsByReference(this.reference)
      .then((events) => (this.eventList = events));
    console.log('events: ', this.eventList);
    this.session = await this.sessionService.getSessionByReference(this.reference);
    console.log('session: ', this.session);
    this.script = this.session.info.e2eScript;
    this.ready = true;
    this.generatingScript = false;
    console.log('ref: ', this.reference);
    console.log('session: ', this.session);
    console.log('events: ', this.eventList);
  }

  async getSessionTest() {
    this.generatingScript = true;
    this.session.info.e2eScript = await this.sessionService.getSessionTest(this.reference);
    this.generatingScript = false;
    this.showScript = true;
    this.updateSession();
  }

  goToPreview() {
    const previewLink = `/session/session-preview?reference=${this.originalReference}`;
    this.router.navigateByUrl(previewLink);
  }

  async updateSession() {
    await this.sessionService.updateSessionInfo(this.session);
  }
  debouncedSaveSession = debounce(async () => this.updateSession(), 1000);
  protected readonly copyToClipboard = copyToClipboard;
}
