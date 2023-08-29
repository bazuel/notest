import { Injectable } from '@nestjs/common';
import { ScheduledTask } from 'node-cron';

const cron = require('node-cron');

@Injectable()
export class CronService {
  constructor() {}

  createCronJob(scheduled_time: string, callBack): ScheduledTask {
    console.log('Cron Job Scheduled');
    return cron.schedule(scheduled_time, callBack);
  }

  deleteCronJob(task: ScheduledTask) {
    console.log('Cron Job Stopped');
    task.stop();
  }
}
