import { Injectable, OnModuleInit } from '@nestjs/common';
import { like, paginated, PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { CryptService } from '../shared/services/crypt.service';
import { CrudService } from '../shared/services/crud.service';
import { NTUser } from '@notest/common';

@Injectable()
export class UserService extends CrudService<NTUser> implements OnModuleInit {
  protected table = 'nt_user';
  protected id = 'nt_userid';

  constructor(db: PostgresDbService, private crypt: CryptService) {
    super(db);
  }

  async onModuleInit() {
    await this.generateTable();
  }

  async generateTable() {
    console.log('generateTable: ', this.table);
    const tableExists = await this.db.tableExists(this.table);
    console.log(this.table + ' tableExists: ', tableExists);
    if (!tableExists)
      await this.db.query`
          create table if not exists ${sql(this.table)}
          (
              nt_userid BIGSERIAL PRIMARY KEY,
              name      text,
              surname   text,
              email     text,
              password  text,
              roles     jsonb,
              state     text,
              phone     text,
              api_token     text,
              created   TIMESTAMPTZ
          );
      `;
    const users = await this.all(0, 10);
    if (users.length == 0)
      await this.createUser({
        email: 'me@salvatoreromeo.com',
        password: this.crypt.hash('prova23424'),
        roles: ['ADMIN'],
        surname: 'Romeo',
        name: 'Salvatore',
        state: 'ACTIVE',
        nt_userid: '',
        phone: ''
      } as NTUser);
  }

  async createUser(user: NTUser) {
    let { nt_userid, ...u } = user;
    if (!u.password) u.password = 'smith@' + Math.round(Math.random() * 1000);
    else u.password = this.crypt.hash(u.password);
    return this.create(u);
  }

  async allNonDeletedUsers(page: number, size: number) {
    return await this.db.query<NTUser>`select *
                                       from ${sql(this.table)}
                                       where state != 'DELETED'
                                       order by email ${paginated(page, size)}`;
  }

  async updateUserRoles(nt_userid: NTUser['nt_userid'], roles: string[]) {
    return await this.db.query`update ${sql(this.table)}
                               set roles = ${roles}
                               where nt_userid = ${nt_userid}`;
  }

  async updateUser(user: Partial<NTUser>) {
    const { password, ...u } = user;
    return await this.update(u);
  }

  async deleteUser(nt_userid: NTUser['nt_userid']) {
    return await this.db.query`delete
                               from ${sql(this.table)}
                               where nt_userid = ${nt_userid}`;
  }

  async findUserByEmail(email: string) {
    return await this.findByField('email', email);
  }

  async findUser(email: string, password: string) {
    let found = await this.findUserByEmail(email);
    if (found.length > 0) {
      let u = found[0];
      if (this.crypt.check(password, u.password)) {
        delete (u as any).password;
        return [u];
      }
    }
    return [];
  }

  async findUserByRole(role: string, page: number, size: number) {
    return await this.db.query<NTUser>`select *
                                       from ${sql(this.table)}
                                       where roles ? ${role} ${paginated(page, size)} `;
  }

  async countUsersByRole(role: string) {
    const result = await this.db.query<{
      count: number;
    }>`select count(*)
       from ${sql(this.table)}
       where roles ? ${role} `;
    return result[0].count;
  }

  async resetUserPassword(nt_userid: NTUser['nt_userid'], password: string) {
    return await this.db.query`update ${sql(this.table)}
                               set password = ${this.crypt.hash(password)}
                               where nt_userid = ${nt_userid}`;
  }

  async userWithEmailExists(email: string) {
    const result = await this.findUserByEmail(email);
    return result.length > 0;
  }

  async findUserByQuery(q: string) {
    return await this.db.query<NTUser>`select *
                                       from ${sql(this.table)}
                                       where ${like('name', q)}
                                          or ${like('surname', q)}
                                          or ${like('email', q)}
                                       limit 100
    `;
  }
}
