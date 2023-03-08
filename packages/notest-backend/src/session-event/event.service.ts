import { Injectable, OnModuleInit } from '@nestjs/common';
import { TimeService } from '../shared/services/time.service';
import { PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { CrudService } from '../shared/services/crud.service';
import { BLSessionEvent, NTEvent } from '@notest/common';

@Injectable()
export class EventService extends CrudService<NTEvent> implements OnModuleInit {
  protected table = 'nt_event';
  protected id = 'event_id';

  constructor(private timeService: TimeService, db: PostgresDbService) {
    super(db);
  }

  async onModuleInit() {
    await this.generateTable();
  }

  async generateTable() {
    const tableExists = await this.db.tableExists(this.table);
    if (!tableExists)
      await this.db.query`
        create table if not exists ${sql(this.table)} (
        ${sql(this.id)} BIGSERIAL PRIMARY KEY,
        reference TEXT,
        url text,
        name TEXT,
        type TEXT,
        sid BIGINT,
        tab BIGINT,
        timestamp BIGINT,
        scope JSONB,
        data JSONB,
        data_path TEXT,
        created TIMESTAMPTZ
    );`;
    await this.db
      .query`CREATE INDEX if not exists nt_event_index ON nt_event(url,name,sid,tab,timestamp);`;
    await this.db
      .query`CREATE INDEX if not exists "nt_event_timestamp" ON "nt_event" ("timestamp");`;
    await this.db.query`CREATE INDEX if not exists "nt_event_name" ON "nt_event" ("name");`;
  }

  async save(hits: BLSessionEvent[], reference: string) {
    if (hits.length == 1) await this.create(this.handleSize(hits[0], reference));
    else {
      const hitsToSave: BLSessionEvent[] = [];
      hits.forEach((h) => {
        hitsToSave.push(this.handleSize(h, reference));
      });
      await this.bulkCreate(hitsToSave);
    }
  }

  private handleSize(h: BLSessionEvent, reference: string) {
    const { url, sid, tab, timestamp, type, name } = h;
    return { url, sid, tab, timestamp, type, name, data: {}, reference };
  }
}
