import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { UserId } from '../shared/token.decorator';
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
    console.log('userId', userId)
    return await this.batteryService.findByField('userid', userId);
  }

  @Post('save-battery')
  async saveBattery(@Body('battery') battery: NTBattery) {
    if (!battery.nt_batteryid) {
      return await this.batteryService.create(battery);
    } else {
      await this.batteryService.update(battery);
      if (battery.active) {
        this.batteryService.updateCronJob(battery);
      } else {
        this.batteryService.deleteCronJob(battery.nt_batteryid);
      }
    }
  }

  @Get('delete-battery')
  async deleteBattery(@Query('battery_id') batteryId: string) {
    await this.batteryService.deleteCronJob(batteryId);
    await this.batteryService.delete(batteryId);
  }
}
