import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SessionUrlParamsService} from "../../services/session-url-params.service";
import {NotesService} from "../../../player/services/notes.service";
import {
  BLConsoleEvent,
  BLGlobalErrorEvent,
  BLGlobalPromiseErrorEvent,
  BLHTTPErrorEvent,
  BLNote,
  Json
} from "@buglink/frontend-shared";
import {blicons} from "../../../shared/components/icon/icon.component";
import {parseStack} from "../../../devtool/components/devtool-error/stack.parser";
import {SessionService} from "../../../player/services/session.service";
import {TabIndex} from "../../tab-index.util";

type RenderedError = {
  show: boolean;
  tab: number;
  type: string, json: Json, value: string, time: number
}

@Component({
  selector: 'bl-devtool-summary',
  templateUrl: './devtool-summary.component.html',
  styleUrls: ['./devtool-summary.component.scss']
})
export class DevtoolSummaryComponent implements OnInit {
  notes: (BLNote & { tab: number })[] = [];
  loading = true
  icons = blicons;
  @Output()
  noteClicked = new EventEmitter<number>();

  renderedErrors: RenderedError[] = [];
  loadingErrors = true;

  constructor(private params: SessionUrlParamsService, private noteService: NotesService, private sessionService: SessionService) {
  }

  async ngOnInit() {
    let {tabs, domain, from, to} = await this.params.get()
    let tabIndex = new TabIndex()
    let notes: (BLNote & { tab: number })[] = []
    for (let t of tabs) {
      let tabNotes = await this.noteService.notes(t, domain, from, to)
      notes.push(...tabNotes.map(n => ({...n, tab: tabIndex.index(t)})))
    }
    this.notes = notes
    this.loading = false
    this.loadingErrors = true
    for (let tab of tabs) {
      const es = await this.sessionService.findErrors(tab, domain, from, to)
      let rs = this.updateRenderedErrors(es, tabIndex.index(tab))
      this.renderedErrors.push(...rs)
    }
    this.loadingErrors = false
  }

  private updateRenderedErrors(es: (BLHTTPErrorEvent | BLConsoleEvent | BLGlobalPromiseErrorEvent | BLGlobalErrorEvent)[], tab: number) {
    let rs: RenderedError[] = []
    for (let e of es) {
      let r: RenderedError = {type: "", json: {}, value: "", time: e.timestamp, show: false, tab}
      if (e.name == "console-error") {
        r.type = "Console"
        r.json = {
          stack: parseStack((e as any).stack),
          arguments: (e as any).arguments
        }
        r.value = JSON.stringify(r.json).substr(0, 100)
      } else if (e.name == "request-error") {
        let ev = (e as any) as BLHTTPErrorEvent
        r.type = "HTTP"
        r.json = {
          request: ev.request
        } as any
        r.value = ev.request.url.substr(0, 100)
      }

      rs.push(r)
    }
    return rs;
  }

}
