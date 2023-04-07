import { PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { BLSessionEvent, NTAssertion, NTComparatorStrategy } from '@notest/common';
import { CrudService } from '../shared/services/crud.service';

export class AssertionService extends CrudService<NTAssertion> {
  protected table = 'nt_assertion';
  protected id = 'assertion_id';

  constructor(db: PostgresDbService) {
    super(db);
    this.generateTable();
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
                    assertions
                    jsonb,
                    info
                    jsonb,
                    created
                    TIMESTAMPTZ
                );
            `;
      await this.db.query`CREATE INDEX ON ${sql(this.table)} (original_reference);`;
    }
  }

  compareSimilarList<T extends BLSessionEvent>(
    comparatorStrategy: NTComparatorStrategy<T>,
    originalEventList: BLSessionEvent[],
    newEventList: BLSessionEvent[],
    filter: (e: BLSessionEvent) => e is T
  ) {
    const originalRequestList = originalEventList.filter(filter);
    const newRequestList = newEventList.filter(filter);
    let requestMap: { [k: string]: T[] } = {};
    for (const event of newRequestList) {
      let key = `${event.request.method}.${event.request.url}`;
      if (!requestMap[key]) requestMap[key] = [];
      requestMap[key].push(event);
    }
    let eventsError: { originalEvent: T; newEvent: T }[] = [];
    let notFoundedEvents: T[] = [];
    for (const currentEvent of originalRequestList) {
      let key = `${currentEvent.request.method}.${currentEvent.request.url}`;
      const similarRequest = requestMap[key]?.shift();
      if (!similarRequest) notFoundedEvents.push(currentEvent);
      else if (!comparatorStrategy(similarRequest, currentEvent)) {
        eventsError.push({ originalEvent: currentEvent, newEvent: similarRequest });
      }
    }
    return { eventsError, notFoundedEvents };
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
