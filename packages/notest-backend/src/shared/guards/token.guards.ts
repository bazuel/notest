import { CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';
import { NTApiPermission, tokenService } from '../services/token.service';

export class _IsAdmin implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const { roles } = tokenService.emailAndRoles(req);
    return roles.indexOf('ADMIN') >= 0;
  }
}

export class _HasToken implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const { roles } = tokenService.emailAndRoles(req);
    return roles.length > 0;
  }
}

class _HasPermission implements CanActivate {
  constructor(private permission: NTApiPermission) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasToken = await new _HasToken().canActivate(context);
    if (!hasToken) return false;
    const { permissions } = tokenService.extractApiTokenData(context.switchToHttp().getRequest());
    return permissions?.includes('ALL') || permissions?.includes(this.permission);
  }
}

export const HasPermission = (permission: NTApiPermission) =>
  UseGuards(new _HasPermission(permission));

export const HasToken = () => UseGuards(new _HasToken());

export const IsAdmin = () => UseGuards(new _IsAdmin());
