import postgres from 'postgres';
require('dotenv').config();

export interface DBConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
const config = {
  host: DB_HOST,
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: +DB_PORT!
};

export const paginated = (page: number, size = 20) =>
  sql` limit ${size} offset ${page * size || 0}`;

export const like = (column: string, value: string) =>
  sql` LOWER(${sql(column)}) like ${'%' + value.toLowerCase() + '%'} `;

export const sql = postgres({
  ...config,
  ssl: { rejectUnauthorized: false }
});

export class PostgresDbService {
  constructor() {
    this.checkDB();
  }

  async query<T>(q: TemplateStringsArray, ...params: any[]) {
    const res = await sql(q, ...params);
    return (res || []) as unknown as T[];
  }

  async checkDB() {
    const res = this.query`SELECT version()`;

    console.log('Postgres version: ', JSON.stringify(res));
  }

  async tableExists(tableName) {
    const tableExistData = await this.query<{ exists }>`
        SELECT EXISTS(
                       SELECT
                       FROM information_schema.tables
                       WHERE table_schema = 'public'
                         AND table_name = ${tableName}
                   );`;
    return tableExistData && tableExistData.length > 0 && tableExistData[0].exists;
  }
}
