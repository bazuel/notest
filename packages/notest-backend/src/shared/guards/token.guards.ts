import { CanActivate, ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { ApiTokenData, NTApiPermissionType, tokenService } from '../services/token.service';
import { emailAndRoles, extractApiTokenData } from '../token.decorator';

@Injectable()
export class Admin implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const { roles } = emailAndRoles(ctx);
    return roles.indexOf('ADMIN') >= 0;
  }
}

@Injectable()
export class HasToken implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> {
    const { roles } = emailAndRoles(ctx);
    return roles.length > 0;
  }
}

class HasApiPermission implements CanActivate {
  constructor(private permission: NTApiPermissionType) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasToken = await new HasToken().canActivate(context);
    if (!hasToken) return false;
    const { api } = extractApiTokenData(
      context.switchToHttp().getRequest(),
      tokenService
    ) as ApiTokenData;
    return api?.includes('ALL') || api?.includes(this.permission);
  }
}

export const HasPermission = (permission: NTApiPermissionType) =>
  UseGuards(new HasApiPermission(permission));
