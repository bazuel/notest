import { Component, OnInit } from '@angular/core';
import { BLSessionEvent } from '@notest/common';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'nt-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  session: BLSessionEvent[] = [];

  constructor(private urlParams: UrlParamsService, private sessionService: SessionService) {}

  async ngOnInit() {
    const fullDomId = this.urlParams.get('id');
    const backendUrl = this.urlParams.get('backend')!;
    const fullDom = await this.sessionService.loadFullDom(fullDomId!, backendUrl);
    this.session = [
      { url: (fullDom as any).href, tab: 1, name: 'dom-full', timestamp: 1, sid: 1, full: fullDom }
    ];
    setTimeout(() => {
      (window as any).bl_shotReady();
    }, 2000);
  }
}
