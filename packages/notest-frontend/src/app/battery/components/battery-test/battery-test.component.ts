import { Component, OnInit } from '@angular/core';
import { NTAssertion, NTBattery, NTSession, NTTest } from '@notest/common';
import { BatteryService } from '../../services/battery.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { SessionService } from '../../../session/services/session.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../shared/services/token.service';
import { BatteryAutocompleteItemComponent } from '../battery-autocomplete-item/battery-autocomplete-item.component';
import { IComponent } from '../../../shared/directives/component-injector.directive';
import { FormatDatePipe } from '../../../shared/pipes/time.pipe';
import { getNextCronJobRun } from '../../../notest-shared/utils/cron-validator.util';

@Component({
  selector: 'nt-battery-test',
  templateUrl: './battery-test.component.html',
  styleUrls: ['./battery-test.component.scss']
})
export class BatteryTestComponent implements OnInit {
  batteryCompleteItem: IComponent = BatteryAutocompleteItemComponent as unknown as IComponent;
  autocompleteFilter = (i: string, q: string) => {
    const stringDate = new FormatDatePipe().transform(+i, 'DD-MM-YYYY, HH:mm');
    return stringDate.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  };
  sessionBattery!: NTBattery;
  sessionSelectedForNewRun: NTSession[] = [];
  showCronJobInfo = false;
  sessionsBatteryRun: {
    reference: string;
    title: string;
    assertions: NTAssertion[];
  }[] = [];
  sessionBatteryTimestamps: string[] = [];
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
    const timestamp = this.urlParamService.get('timestamp');
    if (id) {
      this.sessionBattery = await this.batteryService.findBatteryById(id);
      const battery: Record<string, NTAssertion[]> =
        await this.batteryService.getBatteryHistoryById(id, timestamp);
      for (const [reference, assertions] of Object.entries(battery)) {
        const session = await this.sessionService.getSessionByReference(
          decodeURIComponent(assertions[0].original_reference)
        );
        this.sessionsBatteryRun.push({
          reference: reference,
          title: session.info.title,
          assertions: assertions
        });
      }
      console.log(this.sessionsBatteryRun);
      const timestamps = await this.batteryService.getBatteryTimestamps(id);
      timestamps.forEach((elem) => this.sessionBatteryTimestamps.push(elem.run_timestamp));
      console.log(this.sessionBatteryTimestamps);
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
    this.sessionSelectedForNewRun = await Promise.all(
      this.sessionBattery.session_list.map((reference) =>
        this.sessionService.getSessionByReference(decodeURIComponent(reference))
      )
    );
    this.showSettings = !id;
    console.log(this.sessionsBatteryRun);
  }

  redirectToSession(reference: string) {
    this.router.navigateByUrl(`/session/session-preview?reference=${reference}`);
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

  async redirectToBatteryRun(timestamp: string): Promise<boolean> {
    await this.router.navigateByUrl('/', { skipLocationChange: true });
    return this.router.navigateByUrl(
      `battery/battery-test?id=${this.sessionBattery.nt_batteryid}&timestamp=${timestamp}`
    );
  }

  protected readonly getNextCronJobRun = getNextCronJobRun;
}
