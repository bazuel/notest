import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SessionService } from '../../../session/services/session.service';
import { copyToClipboard, NTBattery, NTSession } from '@notest/common';
import { BatteryService } from '../../services/battery.service';
import { Router } from '@angular/router';
import {
  getNextCronJobRun,
  validateCronExpression
} from '../../../notest-shared/utils/cron-validator.util';
import { CronComponent } from '../../../shared/components/cron/cron.component';

@Component({
  selector: 'nt-battery-test-settings-panel',
  templateUrl: './battery-test-settings-panel.component.html',
  styleUrls: ['./battery-test-settings-panel.component.scss']
})
export class BatteryTestSettingsPanelComponent implements OnInit {
  @ViewChild(CronComponent) cronComponent!: CronComponent;

  sessionsSelected: NTSession[] = [];

  @Output()
  emitSessionSelected = new EventEmitter<NTSession[]>();

  isSavable = false;

  @Input() sessionBattery!: NTBattery;

  @Output() sessionBatteryChange = new EventEmitter<NTBattery>();
  @Output() saveBattery = new EventEmitter<void>();

  constructor(
    private sessionService: SessionService,
    private batteryService: BatteryService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.sessionsSelected = await Promise.all(
      this.sessionBattery.session_list.map((reference) =>
        this.sessionService.getSessionByReference(decodeURIComponent(reference))
      )
    );
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
      (r) => r != session.reference
    );
  }

  addSessionToBattery(sessionReference: string) {
    this.sessionBattery.session_list!.push(sessionReference);
  }

  toggleBackend() {
    this.sessionBattery.backend_type = this.sessionBattery.backend_type == 'full' ? 'mock' : 'full';
  }

  getLink() {
    return `${environment.api}/api/webhook/battery-webhook?id=${this.sessionBattery.nt_batteryid}`;
  }

  copyLink() {
    copyToClipboard(this.getLink());
  }

  async onSessionSelected(item: { reference: string; title: string }) {
    this.addSessionToBattery(item.reference);
    const session: NTSession = await this.sessionService.getSessionByReference(
      decodeURIComponent(item.reference)
    );
    this.sessionsSelected.push(session);
  }

  async delete() {
    await this.batteryService.deleteBatteryTest(this.sessionBattery.nt_batteryid!);
    this.redirectToDashboard();
  }

  redirectToDashboard() {
    this.router.navigateByUrl(`battery/battery-test-dashboard`);
  }

  controlIfIsSavable() {
    const title: string[] = [];

    if (!this.sessionBattery.name) {
      title.push('Set a valid name');
    }
    if (!validateCronExpression(this.sessionBattery.scheduled_time)) {
      title.push('Set a valid schedule time');
    }
    if (!this.sessionBattery.session_list.length) {
      title.push('Select at least one session for the battery');
    }
    this.isSavable = title.length === 0;
    return title.join(', ');
  }
}
