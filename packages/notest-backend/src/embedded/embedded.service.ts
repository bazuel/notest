import { Injectable } from '@nestjs/common';
import { PostgresDbService, sql } from '@notest/backend-shared';
import { CrudService } from '../shared/services/crud.service';
import { NTEmbeddedConfiguration } from '@notest/common';

@Injectable()
export class EmbeddedService extends CrudService<NTEmbeddedConfiguration> {
  protected table = 'nt_embedded';
  protected id = 'id';

  constructor(db: PostgresDbService) {
    super(db);
    this.generateTable();
  }

  async generateTable() {
    const tableExists = await this.db.tableExists(this.table);
    if (!tableExists)
      await this.db.query`
          create table if not exists ${sql(this.table)}
          (
              ${sql(this.id)} BIGSERIAL PRIMARY KEY,
              userid bigint,
              domain text,
              paths jsonb,
              created TIMESTAMPTZ
          );
      `;
  }
}
