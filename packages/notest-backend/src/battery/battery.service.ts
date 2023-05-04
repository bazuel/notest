import { Injectable, OnModuleInit } from '@nestjs/common';
import { CrudService } from '../shared/services/crud.service';
import { TimeService } from '../shared/services/time.service';
import { PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { NTBattery } from '@notest/common';
import { CronService } from '../notest-shared/services/cron.service';
import { ProducerService } from '../notest-shared/services/producer.service';
import { ScheduledTask } from 'node-cron';

@Injectable()
export class BatteryService extends CrudService<NTBattery> implements OnModuleInit {
  protected table = 'nt_battery';
  protected id = 'nt_batteryid';
  protected activeTask: { id: string; task: ScheduledTask }[] = [];

  constructor(
    private timeService: TimeService,
    db: PostgresDbService,
    private cronService: CronService,
    private producerService: ProducerService
  ) {
    super(db);
  }

  async onModuleInit() {
    await this.generateTable();
    await this.initCronService();
  }

  async generateTable() {
    const tableExists = await this.db.tableExists(this.table);
    if (!tableExists)
      await this.db.query`
          create table if not exists ${sql(this.table)}
          (
              ${sql(this.id)} BIGSERIAL PRIMARY KEY,
              name            text,
              type            text,
              userid          bigint,
              active          boolean,
              scheduled_time  text,
              session_list    jsonb,
              backend_type    text,
              created         TIMESTAMPTZ
          );`;
  }

  async initCronService() {
    const batteries: NTBattery[] = await this.db.query`select *
                                                       from ${sql(this.table)}
                                                       where active = true;`;
    for (let battery of batteries) {
      let task = this.cronService.createCronJob(battery.scheduled_time, () =>
        this.runBattery(battery)
      );
      this.activeTask.push({ id: battery.nt_batteryid, task });
    }
  }

  createCronJob(battery: NTBattery) {
    console.log('Cron Job Created');
    let task = this.cronService.createCronJob(battery.scheduled_time, () =>
      this.runBattery(battery)
    );
    this.activeTask.push({ id: battery.nt_batteryid, task });
  }

  deleteCronJob(id: string) {
    const task = this.activeTask.find((task) => task.id == id);
    if (task) {
      this.cronService.deleteCronJob(task.task);
      this.activeTask.splice(this.activeTask.indexOf(task), 1);
    }
  }

  updateCronJob(battery: NTBattery) {
    this.deleteCronJob(battery.nt_batteryid);
    this.createCronJob(battery);
  }

  private runBattery(battery: NTBattery) {
    battery.session_list.forEach(async (session) => {
      console.log('Cron Job Started');
      await this.producerService.produceMessage({
        reference: decodeURIComponent(session),
        backendType: battery.backend_type
      });
    });
  }
}
