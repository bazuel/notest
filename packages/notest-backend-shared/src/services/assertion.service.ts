import { PostgresDbService, sql } from '../shared/services/postgres-db.service';
import {
  BLSessionEvent,
  NTAssertion,
  NTAssertionComparison,
  NTComparatorStrategy
} from '@notest/common';
import { CrudService } from '../shared/services/crud.service';
import { screenshotComparator } from '../session-comparator/visual-assertion/screenshot-comparator';
import { mediaService } from './media.service';

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
              ${sql(this.id)}    BIGSERIAL PRIMARY KEY,
              original_reference text,
              new_reference      text,
              type               text,
              name               text,
              payload            jsonb,
              created            TIMESTAMPTZ
          );
      `;
      await this.db.query`CREATE INDEX ON ${sql(this.table)} (original_reference);`;
    }
  }

  async compareImages(targetList: DOMRect[], reference: string, newReference: string) {
    const { assertionScreenshot, imagesSimilarity } = await screenshotComparator.compare(
      reference,
      newReference,
      targetList
    );
    await mediaService.saveScreenshot(assertionScreenshot, newReference);
    return { imagesSimilarity };
  }

  compareSimilarList<T extends BLSessionEvent>(
    comparatorStrategy: NTComparatorStrategy<T>,
    originalEventList: BLSessionEvent[],
    newEventList: BLSessionEvent[],
    filter: (e: BLSessionEvent) => e is T
  ) {
    let eventsError: NTAssertionComparison<T>[] = [];
    let notFoundedEvents: T[] = [];

    const originalList = originalEventList.filter(filter);
    const newList = newEventList.filter(filter);

    let eventMap: { [k: string]: T[] } = {};
    for (const event of newList) {
      let key = `${event.request.method}.${event.request.url}`;
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(event);
    }

    for (const originalEvent of originalList) {
      let key = `${originalEvent.request.method}.${originalEvent.request.url}`;
      const newEvent = eventMap[key]?.shift();
      if (!newEvent) notFoundedEvents.push(originalEvent);
      else if (!comparatorStrategy(newEvent, originalEvent)) {
        eventsError.push({ originalEvent, newEvent });
      }
    }
    return { eventsError, notFoundedEvents };
  }

  async save(assert: NTAssertion) {
    return this.db.query<NTAssertion>`
        insert into ${sql(this.table)}
            ${sql({ ...cleanUndefined(assert), created: new Date() })} returning *`;
  }

  async countRerun(originalReference: string) {
    const result = await this.db.query<{ count: number }>`
        select count(distinct (original_reference, new_reference))
        from nt_assertion
        where original_reference = ${originalReference}
          and type = 'runSuccessfullyFinished'`;
    return result[0].count;
  }
}

export const assertionService = new AssertionService(new PostgresDbService());

function cleanUndefined(o) {
  Object.keys(o).forEach((key) => {
    if (o[key] === undefined) delete o[key];
  });
  return o;
}
