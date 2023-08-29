import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { NTAssertion, NTBattery } from '@notest/common';
@Injectable({
  providedIn: 'root'
})
export class BatteryService {
  constructor(private http: HttpService) {}

  async findBatteryByUserId() {
    return await this.http.get<NTBattery[]>(`/battery/find-by-userid`);
  }

  async findBatteryById(id: string) {
    return await this.http.gest<NTBattery>(`/battery/find-by-id`, { id });
  }

  async saveBatteryTest(battery: NTBattery): Promise<NTBattery> {
    return await this.http.post<NTBattery>(`/battery/save-battery`, { battery });
  }

  async deleteBatteryTest(id: string) {
    await this.http.gest<NTBattery>('/battery/delete-battery', { battery_id: id });
  }

  async getBatteryHistoryById(id: string, timestamp?: string) {
    console.log('New request');
    return await this.http.gest<Record<string, NTAssertion[]>>('/session/get-battery-run-history', {
      battery_id: id,
      battery_timestamp: timestamp
    });
  }

  async getBatteryTimestamps(id: string) {
    return await this.http.gest<{ run_timestamp: string }[]>(
      '/session/get-battery-run-timestamps',
      { battery_id: id }
    );
  }
}
