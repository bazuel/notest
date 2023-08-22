import { Injectable } from '@nestjs/common';
import { NTInstrumentedEvent } from '@notest/common';
import { CrudService } from '../shared/services/crud.service';
import { PostgresDbService, sql } from '@notest/backend-shared';

@Injectable()
export class InstrumentedEventService extends CrudService<NTInstrumentedEvent> {
  protected table = 'nt_instrumented_event';
  protected id = 'event_id';

  constructor(db: PostgresDbService) {
    super(db);
  }

  async onModuleInit() {
    await this.generateTable();
  }

  async generateTable() {
    await this.db.query`
            create table if not exists ${sql(this.table)}(
                ${sql(this.id)} BIGSERIAL PRIMARY KEY,
                project_name text,
                script_type text CHECK (script_type IN ('function' , 'method')),
                event_type text CHECK (event_type IN ('input' , 'output' , 'variable' , 'expression' , 'exception', 'text')),
                event_value JSONB,
                line integer,
                script_name text,
                filepath text,
                fired bigint,
                other JSONB,
                created TIMESTAMPTZ
            );
        `;
  }

  async bulkSave(data: NTInstrumentedEvent[]): Promise<void> {
    await this.bulkCreate(data);
  }

  async getAllRoutinesFromDb(request: {
    projectName: string;
    scriptType: string;
    filePath: string;
    functionName: string;
  }): Promise<NTInstrumentedEvent[]> {
    return await this.db.query`
                    select * 
                    from ${sql(this.table)}
                    where project_name = '${request.projectName}'
                          and script_type = '${request.scriptType}'
                          and filepath = '${request.filePath}'
                          and script_name = '${request.functionName}'
                    order by infoid`;
  }

  async getFullTextFromDb(request: {
    projectName: string;
    path: string;
    name: string;
    created: string;
  }): Promise<NTInstrumentedEvent[]> {
    return await this.db.query`
                    select * 
                    from ${sql(this.table)}
                    where project_name = ${request.projectName}
                      and filepath = ${request.path}
                      and script_name = ${request.name}
                      and fired = ${request.created}
                      and event_type = 'text'`;
  }

  async getRoutine(request: {
    projectName: string;
    path: string;
    name: string;
    created: string;
  }): Promise<NTInstrumentedEvent[]> {
    return await this.db.query`
                    select * 
                    from ${sql(this.table)}
                    where project_name = ${request.projectName}
                      and filepath = ${request.path}
                      and script_name = ${request.name}
                      and fired = ${request.created}`;
  }
}
