import { Component, OnInit } from '@angular/core';
import { NTAssertion, NTBattery, NTSession } from '@notest/common';
import { BatteryService } from '../../services/battery.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { SessionService } from '../../../session/services/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'nt-battery-test',
  templateUrl: './battery-test.component.html',
  styleUrls: ['./battery-test.component.scss']
})
export class BatteryTestComponent implements OnInit {
  sessionBattery: NTBattery = {
    active: false,
    session_list: [],
    backend_type: 'full',
    name: ''
  } as any;
  userSessions: NTSession[] = {} as NTSession[];
  batterySaved: boolean = false;
  sessionSelected: { reference: string; title: string }[] = [];
  showSettings = false;
  invalidTitle = false;
  invalidScheduledTime = false;
  sessionItemForAutocomplete: { reference: string; title: string }[] = [];
  sessionBatteryRunHistory: {
    sessions: {
      session: NTSession;
      assertions: NTAssertion[];
      showInfo: boolean;
    }[];
  }[] = [];

  constructor(
    private batteryService: BatteryService,
    private urlParamService: UrlParamsService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.urlParamService.get('id');
    if (id) {
      this.sessionBattery = await this.batteryService.findBatteryById(id!);
      this.batterySaved = true;
    }
    await this.sessionService
      .getSessionsByUserid()
      .then((data) => (this.userSessions = data.sessions));
    // this.sessionBatteryRunHistory = await this.sessionService.getSessionBatteryRunHistory(
    //   this.sessionBattery.session_list!
    // );
    this.userSessions.map((session) =>
      this.sessionItemForAutocomplete.push({
        reference: session.reference,
        title: session.info.title
      })
    );
    for (let ref of this.sessionBattery.session_list) {
      this.sessionSelected.push(this.sessionItemForAutocomplete.find((e) => e.reference == ref)!);
    }
    this.showSettings = !this.batterySaved;
  }

  deleteSession(session: { reference: string; title: string }) {
    this.sessionSelected?.splice(this.sessionSelected?.indexOf(session), 1);
    const reference = this.sessionBattery.session_list?.find(
      (reference) => reference === session.reference
    );
    if (reference) {
      this.sessionBattery.session_list?.splice(
        this.sessionBattery.session_list?.indexOf(reference),
        1
      );
    }
  }

  addSessionToBattery(sessionReference: string) {
    this.sessionBattery.session_list!.push(sessionReference);
    console.log('Session List', this.sessionBattery.session_list);
  }

  toggleBackend() {
    if (this.sessionBattery.backend_type == 'full') {
      this.sessionBattery.backend_type = 'mock';
    } else {
      this.sessionBattery.backend_type = 'full';
    }
  }

  async saveBattery() {
    this.invalidScheduledTime = false;
    if (this.sessionBattery.name.length > 0) {
      this.invalidTitle = false;
      if (!this.sessionBattery.scheduled_time) {
        this.invalidScheduledTime = true;
      } else {
        this.batterySaved = true;
        let bat = await this.batteryService.saveBatteryTest(this.sessionBattery);
        this.sessionBattery.nt_batteryid = bat[0].nt_batteryid;
        this.redirectToBattery(bat[0].nt_batteryid);
      }
    } else {
      this.invalidTitle = true;
    }
  }
  async updateBattery() {
    this.invalidScheduledTime = false;
    if (this.sessionBattery.name.length > 0) {
      this.invalidTitle = false;
      if (!this.sessionBattery.scheduled_time) {
        this.invalidScheduledTime = true;
      } else {
        await this.batteryService.updateBatteryTest(this.sessionBattery);
      }
    } else {
      this.invalidTitle = true;
    }
  }

  async deleteBattery() {
    await this.batteryService.deleteBatteryTest(this.sessionBattery.nt_batteryid!);
    this.redirectToDashboard();
  }
  redirectToDashboard() {
    this.router.navigateByUrl(`battery/battery-test-dashboard`);
  }
  redirectToBattery(id: string) {
    this.router.navigateByUrl(`battery/battery-test?id=${id}`);
  }
}
