import { Injectable } from '@nestjs/common';
import { PostgresDbService, sql } from '@notest/backend-shared';
import { CrudService } from '../shared/services/crud.service';
import { NTEmbedded } from '@notest/common';

@Injectable()
export class EmbeddedService extends CrudService<NTEmbedded> {
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
              domain text,
              configuration jsonb,
              created TIMESTAMPTZ
          );
      `;
  }
}
