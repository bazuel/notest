import { Component, OnInit } from '@angular/core';
import { NTBattery, NTSession, NTTest } from '@notest/common';
import { BatteryService } from '../../services/battery.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { SessionService } from '../../../session/services/session.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../shared/services/token.service';

@Component({
  selector: 'nt-battery-test',
  templateUrl: './battery-test.component.html',
  styleUrls: ['./battery-test.component.scss']
})
export class BatteryTestComponent implements OnInit {
  sessionBattery!: NTBattery;
  sessionsSelected: NTSession[] = [];
  showSettings = false;
  invalidTitle = false;
  invalidScheduledTime = false;

  constructor(
    private batteryService: BatteryService,
    private urlParamService: UrlParamsService,
    private sessionService: SessionService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.urlParamService.get('id');
    if (id) {
      this.sessionBattery = await this.batteryService.findBatteryById(id);
      this.sessionsSelected = await Promise.all(
        this.sessionBattery.session_list.map((reference) =>
          this.sessionService.getSessionByReference(decodeURIComponent(reference))
        )
      );
    } else {
      this.sessionBattery = {
        userid: +this.tokenService.tokenData().id,
        active: false,
        session_list: [],
        backend_type: 'full',
        scheduled_time: '',
        name: '',
        type: this.urlParamService.get('type') as NTTest
      };
    }
    this.showSettings = !id;
  }

  findBatteryByUseridAndTitle = async (q) => {
    const results = await this.sessionService.getSessionsByUserid();
    return results.sessions
      .filter((session) => session.info.title.includes(q))
      .map((session) => ({ reference: session.reference, title: session.info.title }));
  };

  deleteSession(session: NTSession) {
    this.sessionsSelected = this.sessionsSelected?.filter((s) => s != session);
    this.sessionBattery.session_list = this.sessionBattery.session_list?.filter(
      (r) => r == session.reference
    );
  }

  addSessionToBattery(sessionReference: string) {
    this.sessionBattery.session_list!.push(sessionReference);
  }

  toggleBackend() {
    this.sessionBattery.backend_type = this.sessionBattery.backend_type == 'full' ? 'mock' : 'full';
  }

  async save() {
    this.invalidScheduledTime = this.sessionBattery.scheduled_time == '';
    this.invalidTitle = this.sessionBattery.name == '';
    if (!this.invalidScheduledTime && !this.invalidTitle) {
      let bat = await this.batteryService.saveBatteryTest(this.sessionBattery);
      if (!this.sessionBattery.nt_batteryid) {
        this.sessionBattery.nt_batteryid = bat[0].nt_batteryid;
        this.router.navigateByUrl(`battery/battery-test?id=${this.sessionBattery.nt_batteryid}`);
      }
    }
  }

  async delete() {
    await this.batteryService.deleteBatteryTest(this.sessionBattery.nt_batteryid!);
    this.redirectToDashboard();
  }

  redirectToDashboard() {
    this.router.navigateByUrl(`battery/battery-test-dashboard`);
  }

  async onSessionSelected(item: { reference: string; title: string }) {
    this.addSessionToBattery(item.reference);
    const session: NTSession = await this.sessionService.getSessionByReference(
      decodeURIComponent(item.reference)
    );
    console.log('Session', session);
    this.sessionsSelected.push(session);
  }
}
