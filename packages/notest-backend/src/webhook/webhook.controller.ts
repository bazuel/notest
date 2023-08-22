import { Controller, Get, Query } from '@nestjs/common';
import { UserId } from '../shared/token.decorator';
import { BatteryService } from '../battery/battery.service';
import { HasPermission } from '../shared/guards/token.guards';

@Controller('webhook')
export class WebhookController {
  constructor(private batteryService: BatteryService) {}

  @HasPermission('ALL')
  @Get('battery-webhook')
  async executeBattery(@Query('id') id: string, @UserId() userId: number) {
    const battery = await this.batteryService.findById(id);
    if (battery.userid == userId) {
      this.batteryService.runBattery(battery);
    }
  }
}
