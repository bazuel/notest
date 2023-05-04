import { Component, OnInit } from '@angular/core';
import { NTBattery } from '@notest/common';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { Router } from '@angular/router';
import { BatteryService } from '../../services/battery.service';
@Component({
  selector: 'nt-battery-test-dashboard',
  templateUrl: './battery-test-dashboard.component.html',
  styleUrls: ['./battery-test-dashboard.component.scss']
})
export class BatteryTestDashboardComponent implements OnInit {
  activeBatteryList: NTBattery[] = [];

  constructor(
    private urlParamService: UrlParamsService,
    private router: Router,
    private batteryService: BatteryService
  ) {}
  async ngOnInit() {
    this.activeBatteryList = await this.batteryService.findBatteryByUserId();
  }

  createNewBattery() {
    const batteryLink = this.router.url.replace('battery-test-dashboard', 'battery-test');
    this.router.navigateByUrl(batteryLink);
  }

  redirectToBatteryTest(batteryId: string) {
    this.router.navigateByUrl(`battery/battery-test?id=${batteryId}`);
  }
}
