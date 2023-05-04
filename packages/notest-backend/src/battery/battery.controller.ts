import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { UserId, UserIdIfHasToken } from '../shared/token.decorator';
import { NTBattery } from '@notest/common';

@Controller('battery')
export class BatteryController {
  constructor(private batteryService: BatteryService) {}
  @Get('find-by-id')
  async getBatteryById(@Query('id') id: string) {
    return await this.batteryService.findById(id);
  }

  @Get('find-by-userid')
  async getBatteryByUserid(@UserId() userId: number) {
    return await this.batteryService.findByField('userid', userId);
  }
  @Post('create-battery')
  async createBattery(@Body('battery') battery: NTBattery, @UserIdIfHasToken() userid) {
    battery.userid = userid;
    return await this.batteryService.create(battery);
  }
  @Get('delete-battery')
  async deleteBattery(@Query('battery_id') batteryId: string) {
    await this.batteryService.deleteCronJob(batteryId);
    await this.batteryService.delete(batteryId);
  }
  @Post('update-battery')
  async updateBattery(@Body('battery') battery: NTBattery) {
    console.log(battery);
    await this.batteryService.update(battery);
    if (battery.active) {
      await this.batteryService.deleteCronJob(battery.nt_batteryid);
      await this.batteryService.createCronJob(battery);
    } else {
      await this.batteryService.deleteCronJob(battery.nt_batteryid);
    }
  }
}
