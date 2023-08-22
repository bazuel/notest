import { like, paginated, PostgresDbService, sql } from '@notest/backend-shared';

export class CrudService<T> {
  protected table = 'nt_';
  protected id = 'id';

  constructor(protected db: PostgresDbService) {}

  async count(fieldsMap?: { [key in keyof T]: string | number | Date }) {
    const payload: {
      column: keyof T | string;
      value: string | number | any;
    }[] = [];
    for (const c in fieldsMap || {}) payload.push({ column: c, value: fieldsMap[c] });

    const result = await this.db.query<{
      count: number;
    }>`select count(*)
       from ${sql(this.table)} ${
      payload.length == 0
        ? sql``
        : sql` where ${sql(payload[0].column as string)} = ${payload[0].value as string}`
    } ${
      payload.length <= 1
        ? sql``
        : payload
            .slice(1)
            .map((elem) => sql` and ${sql(elem.column as string)} = ${elem.value as string}`)
    }
    `;
    return result[0].count;
  }

  async all<T>(page: number, size: number, options: { order?: string } = {}) {
    return await this.db.query<T>`
        select *
        from ${sql(this.table)} ${
      options.order ? sql`order by ${options.order}` : sql``
    } ${paginated(page, size)}`;
  }

  async create(item: Partial<T>) {
    return this.db.query<T>`
        insert into ${sql(this.table)}
            ${sql({
              ...cleanUndefined(item as any),
              created: new Date()
            })}
            returning *` as any;
  }

  async bulkCreate(items: Partial<T>[] | any) {
    const itemsPlusCreated = items.map((i) => ({ ...i, created: new Date() }));
    // postgres handles at most 65k parameters per query, so we split the
    // items 1000 by 1000 assuming each item spends at most 65 parameters
    let from = 0;
    let to = 1000;
    do {
      const pack = itemsPlusCreated.slice(from, to);
      pack.forEach((i, index) => {
        const keys = Object.keys(i);
        const nullValues = keys.map((k) => i[k]).filter((v) => v == null || v == undefined);
        if (nullValues.length > 0) throw new Error(index + ' ' + JSON.stringify(i));
      });
      await this.db.query<any>`insert into ${sql(this.table)} ${sql(pack)}`;
      from = to;
      to = to + 1000;
    } while (to < itemsPlusCreated.length);
    try {
      const lastPack = itemsPlusCreated.slice(to - 1000);
      if (lastPack.length > 0)
        await this.db.query<any>`insert into ${sql(this.table)} ${sql(lastPack)}`;
    } catch (e) {
      console.log(e);
    }
  }

  async update(item: Partial<T>) {
    return await this.db.query<T>`
        update ${sql(this.table)}
        set ${sql(cleanUndefined(item) as any)}
        where ${sql(this.id)} = ${item[this.id]}
        returning *`;
  }

  async delete(id: string) {
    return await this.db.query`delete
                               from ${sql(this.table)}
                               where ${sql(this.id)} = ${id}
                               returning *`;
  }

  async findById(id: string) {
    const items = await this.db.query<T>`select *
                                         from ${sql(this.table)}
                                         where ${sql(this.id)} = ${id}`;
    return items[0];
  }

  async findByIds(ids: string[]): Promise<T[]> {
    const items = await this.db.query<T>`select *
                                         from ${sql(this.table)}
                                         where ${sql(this.id)} IN ${sql(ids)}`;
    return items;
  }

  async findByField(field: keyof T, value: any, options: { page?: number; size?: number } = {}) {
    const items = await this.db.query<T>`
        select *
        from ${sql(this.table)}
        where ${sql(field as string)} = ${value}
        order by created desc
            ${paginated(options.page ?? 0, options.size ?? 100)}`;
    return items;
  }

  async findByFields(
    fieldsMap: { [key in keyof T]: string | number | Date },
    options: { page?: number; size?: number } = {}
  ) {
    const payload: { column: keyof T; value: string | number | any }[] = [];
    for (const c in fieldsMap) payload.push({ column: c, value: fieldsMap[c] });

    return await this.db.query<T>`select *
                                  from ${sql(this.table)}
                                  where ${sql(payload[0].column as string)} = ${
      payload[0].value as string
    }
                                      ${
                                        payload.length == 1
                                          ? sql``
                                          : payload
                                              .slice(1)
                                              .map(
                                                (elem) =>
                                                  sql` and ${sql(elem.column as string)} = ${
                                                    elem.value as string
                                                  }`
                                              )
                                      }
                                  order by created desc
                                      ${paginated(options.page ?? 0, options.size ?? 100)}`;
  }

  async findByQuery(q: string, ...columns: (keyof T)[]) {
    return await this.db.query<T>`
        select *
        from ${sql(this.table)}
        where ${[columns[0]].map((c) => sql` ${like(c as string, q)} `)}
                  ${columns.slice(1).map((c) => sql` or ${like(c as string, q)} `)}
        limit 100
    `;
  }

  async findFieldByQuery(q: string, field: keyof T) {
    const result = await this.db.query<T>`
        select distinct ${sql(field as string)}
        from ${sql(this.table)}
        where ${like(field as string, q || '')}
        limit 100`;
    return result.map((r) => r[field]);
  }

  async findValuesByField(field: keyof T, fieldValue, targetField: keyof T) {
    const result = await this.db.query<T>`
        select distinct ${sql(targetField.toString())}
        from ${sql(this.table)}
        where ${sql(field as string)} = ${fieldValue}
        limit 100`;
    return result.map((r) => r[targetField]);
  }

  async findByFieldNot(field: keyof T, value: any, options: { page?: number; size?: number } = {}) {
    const items = await this.db.query<T>`
        select *
        from ${sql(this.table)}
        where ${sql(field as string)} != ${value}
        order by created desc
            ${paginated(options.page ?? 0, options.size ?? 100)}`;
    return items;
  }
}

function cleanUndefined(o) {
  Object.keys(o).forEach((key) => {
    if (o[key] === undefined) delete o[key];
  });
  return o;
}
