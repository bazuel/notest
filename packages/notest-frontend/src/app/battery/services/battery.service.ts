import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { NTBattery } from '@notest/common';
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
    return await this.http.post<NTBattery>(`/battery/create-battery`, { battery });
  }
  async updateBatteryTest(battery: NTBattery) {
    return await this.http.post<NTBattery>(`/battery/update-battery`, { battery });
  }
  async deleteBatteryTest(id: string) {
    await this.http.gest<NTBattery>('/battery/delete-battery', { battery_id: id });
  }
}
