import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Response
} from '@nestjs/common';
import { UserService } from './user.service';
import { EmailService } from '../shared/services/email.service';
import { ApiTokenData, NTApiPermission, TokenService } from '../shared/services/token.service';
import { Roles, UserId } from '../shared/decorators/token.decorator';
import { NTRole, NTUser } from '@notest/common';
import { MessagesService } from './messages.service';
import { HasToken, IsAdmin } from '../shared/guards/token.guards';
import { ConfigService } from '@notest/backend-shared';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly messagesService: MessagesService
  ) {}

  @Post('login')
  async login(@Body() user: NTUser) {
    const found = await this.userService.findUser(
      user.email.trim().toLowerCase(),
      user.password.trim()
    );
    if (found.length > 0) {
      const token = this.tokenService.generate({
        id: +found[0].nt_userid,
        email: user.email,
        name: found[0].name,
        surname: found[0].surname,
        roles: found[0].roles
      });
      return { token };
    } else throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }

  @Get('check-password')
  async checkPassword(@Query('password') password: string, @Query('email') email: string) {
    const found = await this.userService.findUser(email.trim().toLowerCase(), password.trim());
    if (found.length > 0) return { ok: true };
    return { ok: false };
  }

  @Post('request-registration')
  async register(@Body() user: NTUser) {
    console.log('registering user: ', user);
    const result = await this.userService.createUser(user);
    console.log('user saved into db');
    const token = this.tokenService.generate({
      user,
      nt_userid: result[0].nt_userid
    });
    console.log('token: ', token);
    const link = this.configService.backend_url + '/api/user/register?token=' + token;
    await this.emailService.send(
      user.email,
      this.messagesService.email.welcomeSubject,
      this.messagesService.email.welcomeBody(user.name, link)
    );
    console.log('email sent');
    return { ok: true };
  }

  @Get('register')
  async confirmRegistration(@Query('token') token: string, @Response() res) {
    try {
      let data = this.tokenService.verify(token) as unknown as {
        user: NTUser;
        roles: string[];
        nt_userid: string;
      };
      console.log('data: ', data);
      const user = data.user;
      user.email = user.email.trim().toLowerCase();
      user.password = user.password.trim();
      const foundUser = await this.userService.findById(data.nt_userid);
      if (!foundUser) throw new HttpException(`Cannot find this user: ${token}`, 404);
      await this.userService.updateUserRoles(data.nt_userid, ['USER']);
      console.log('user saved into db');
      /*const loginToken = this.tokenService.generate({
              id: this.cryptService.encode(+data.nt_userid),
              email: user.email,
              roles: data.roles
            });*/
      res.header(
        'Location',
        `${this.configService.app_url}/auth/registration-success?token=${token}`
      );
      res.status(302).send();
    } catch {
      res.header('Location', `${this.configService.app_url}/error`);
      res.status(500).send();
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    const token = this.tokenService.generate({ email });
    const url = this.configService.app_url;
    const link = `${url}/auth/login?token=${token}`;
    await this.emailService.send(
      email.trim().toLowerCase(),
      this.messagesService.passwordForgot.emailSubject,
      this.messagesService.passwordForgot.emailBody(link)
    );
    return { ok: true };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetData: { token: string; password: string }) {
    const token = this.tokenService.verify(resetData.token);
    let user = await this.userService.findUserByEmail(token.email.trim().toLowerCase());
    await this.userService.resetUserPassword(user[0].nt_userid, resetData.password.trim());
    return { ok: true };
  }

  @Get('email-exists')
  async checkEmail(@Query('email') email: string) {
    let exists = await this.userService.userWithEmailExists(email.trim().toLowerCase());
    return { exists };
  }

  @Get('list')
  @IsAdmin()
  async list(
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('includeDeleted') includeDeleted: string
  ) {
    let users: NTUser[];
    if (includeDeleted == 'true') {
      users = await this.userService.all(page, size);
    } else users = await this.userService.allNonDeletedUsers(page, size);
    return users.map((u) => ({ ...u, password: '' }));
  }

  @Get('find')
  async find(@Query('id') userid: string, @Roles() roles: NTRole[], @UserId() personalId?: string) {
    if (userid != personalId && !roles.includes('ADMIN'))
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    const user = await this.userService.findById(userid || personalId);
    delete user.password;
    return user;
  }

  @Get('find-by-query')
  async findByQuery(@Query('q') q: string) {
    const users = await this.userService.findUserByQuery(q);
    users.forEach((u) => delete u.password);
    return users;
  }

  @Post('update')
  @HasToken()
  async updateUser(
    @Body('user') user: NTUser,
    @Roles() roles: NTRole[],
    @UserId() userid?: string
  ) {
    if (userid != user.nt_userid && !roles.includes('ADMIN'))
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    if (!user.nt_userid) {
      if (!user.state) user.state = 'ACTIVE';
      if (!roles.includes('ADMIN')) user.roles = user.roles.filter((r) => r !== 'ADMIN');
      const [result] = await this.userService.createUser(user);
      return result;
    } else {
      if (!roles.includes('ADMIN')) user.roles = user.roles.filter((r) => r !== 'ADMIN');
      const [result] = await this.userService.updateUser(user);
      return result;
    }
  }

  @Get('find-users-by-id')
  @IsAdmin()
  async findUserByIds(@Query('ids') ids: string) {
    let users = await this.userService.findByIds(ids.split(','));
    return users.map((u) => ({ ...u, password: '' }));
  }

  @Get('generate-api-token')
  @HasToken()
  async generateApiToken(
    @UserId() userId: string,
    @Query('permission_type') permissionType: NTApiPermission
  ) {
    const user = await this.userService.findById(userId);
    const apiToken: Partial<ApiTokenData> = {
      id: userId,
      permissions: [permissionType],
      roles: user.roles
    };
    const api_token = this.tokenService.generateApiToken(apiToken, '1y');
    await this.userService.updateUser({ nt_userid: userId, api_token });
    return { api_token };
  }

  @Get('get-api-token')
  @HasToken()
  async getApiToken(@UserId() userid: string) {
    return await this.userService.findById(userid).then((user) => {
      return { apiToken: user.api_token };
    });
  }

  @Get('delete-api-token')
  @HasToken()
  async deleteApiToken(@UserId() userId: string) {
    const api_token = '';
    await this.userService.updateUser({ nt_userid: userId, api_token });
  }

  @Get('get-permissions')
  @HasToken()
  async verifyApiToken(@Query('api-token') apiToken) {
    return this.tokenService.verify<ApiTokenData>(apiToken).permissions;
  }
}
