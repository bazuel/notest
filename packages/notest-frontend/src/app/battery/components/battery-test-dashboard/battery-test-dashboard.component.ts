import { Component, OnInit } from '@angular/core';
import { NTBattery, NTTest } from '@notest/common';
import { Router } from '@angular/router';
import { BatteryService } from '../../services/battery.service';

@Component({
  selector: 'nt-battery-test-dashboard',
  templateUrl: './battery-test-dashboard.component.html',
  styleUrls: ['./battery-test-dashboard.component.scss']
})
export class BatteryTestDashboardComponent implements OnInit {
  activeBatteryList: NTBattery[] = [];

  constructor(private router: Router, private batteryService: BatteryService) {}

  async ngOnInit() {
    this.activeBatteryList = await this.batteryService
      .findBatteryByUserId()
      .then((batteries) => batteries.filter((battery) => battery.type == 'e2e'));
  }

  createNewBattery(type: NTTest) {
    this.router.navigateByUrl(`battery/battery-test?type=${type}`);
  }

  redirectToBatteryTest(batteryId: string) {
    this.router.navigateByUrl(`battery/battery-test?id=${batteryId}`);
  }
}
