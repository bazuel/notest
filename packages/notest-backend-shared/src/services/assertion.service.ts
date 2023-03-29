import { PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { BLHTTPResponseEvent, BLSessionEvent, NTAssertion } from '@notest/common';
import { CrudService } from '../shared/services/crud.service';
import { HttpComparator } from '../session-comparator/http-assertion/http-comparator';
import { StatusResponseAssertion } from '../session-comparator/http-assertion/status-response.assertion';

export class AssertionService extends CrudService<NTAssertion> {
  protected table = 'nt_assertion';
  protected id = 'assertion_id';
  private httpComparator: HttpComparator;

  constructor(db: PostgresDbService) {
    super(db);
    this.generateTable();
    this.httpComparator = new StatusResponseAssertion();
  }

  async generateTable() {
    const tableExists = await this.db.tableExists(this.table);
    if (!tableExists) {
      await this.db.query`
                create table if not exists ${sql(this.table)}
                (
                    ${sql(this.id)}
                    BIGSERIAL
                    PRIMARY
                    KEY,
                    original_reference
                    text,
                    new_reference
                    text,
                    info
                    jsonb,
                    created
                    TIMESTAMPTZ
                );
            `;
      await this.db.query`CREATE INDEX ON ${sql(this.table)} (original_reference);`;
    }
  }

  compareHttpRequest(originalEventList: BLSessionEvent[], newEventList: BLSessionEvent[]) {
    const httpEventsFilter = (event: BLSessionEvent) => event.name === 'after-response';
    const originalRequestList = originalEventList.filter(
      httpEventsFilter
    ) as unknown as BLHTTPResponseEvent[];
    const newRequestList = newEventList.filter(
      httpEventsFilter
    ) as unknown as BLHTTPResponseEvent[];
    return this.httpComparator.compareList(originalRequestList, newRequestList);
  }

  async save(assert: NTAssertion) {
    console.log('Saving:', assert);
    return this.db.query<NTAssertion>`
            insert into ${sql(this.table)}
                ${sql({ ...cleanUndefined(assert), created: new Date() })} returning *`;
  }
}

export const assertionService = new AssertionService(new PostgresDbService());

function cleanUndefined(o) {
  Object.keys(o).forEach((key) => {
    if (o[key] === undefined) delete o[key];
  });
  return o;
}
