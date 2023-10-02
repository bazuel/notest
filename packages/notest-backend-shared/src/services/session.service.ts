import { CrudService } from '../shared/services/crud.service';
import { db, PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { storageService } from '../shared/services/storage.service';
import { StorageService } from '../shared/services/storage.service.interface';
import { BLSessionEvent, NTSession, pathSessionFromReference, unzipJson } from '@notest/common';
import { TimeService } from '../shared/services/time.service';

export class SessionService extends CrudService<NTSession> {
  protected table = 'nt_session';
  protected id = 'session_id';

  constructor(
    private timeService: TimeService,
    db: PostgresDbService,
    private storageService: StorageService
  ) {
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
              url             text,
              userid          bigint,
              reference       text,
              info            jsonb,
              created         TIMESTAMPTZ
          );
      `;
  }

  async save(events: Buffer | Uint8Array, session: Partial<NTSession>) {
    const path = pathSessionFromReference(session.reference);
    const id = await this.create(session).then((result) => result[0][this.id]);
    console.log('Uploaded New Session to DB');
    await this.storageService.upload(events, path);
    console.log('Uploaded New Session to Storage');
    return { id };
  }

  async read(reference: string): Promise<BLSessionEvent[]> {
    const path = pathSessionFromReference(encodeURIComponent(reference));
    const sessionZipped = await this.storageService.read(path);
    return await unzipJson(sessionZipped);
  }

  async getLoginSessionIfExists(reference: string) {
    const session = await this.findByField('reference', encodeURIComponent(reference));
    if (!session[0].info?.loginReference) return undefined;
    return this.read(decodeURIComponent(session[0].info.loginReference));
  }

  async getTargetListFromReference(reference: string) {
    const session = await this.findByField('reference', encodeURIComponent(reference));
    return session[0].info.targetList;
  }

  async findByUrl(url: string) {
    return await this.findByField('url', url);
  }

  async findByDomain(domain: string, userid: string): Promise<NTSession[]> {
    return await this.db.query`
        select *
        from ${sql(this.table)}
        where url ilike ${'%' + domain + '%'}
          and userid = ${userid}
    `;
  }
}

export const sessionService = new SessionService(new TimeService(), db, storageService);
