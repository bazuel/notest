import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { globalConfig } from '@notest/backend-shared';

import * as jwt from 'jsonwebtoken';

interface TokenBaseData {
  id: string;
  created: Date;
  exp: number;
  roles?: string[];
}

export interface TokenData extends TokenBaseData {
  tenant?: string;
  iat: number;
  email: string;
}

export interface ApiTokenData extends TokenBaseData {
  permissions?: NTApiPermission[];
}

export type NTApiPermission = 'ALL';

export interface GenericRequest {
  headers: { [header: string]: string };
  query: { [param: string]: string };
}

@Injectable()
export class TokenService {
  constructor(private masterPassword: string) {}

  generate<X = TokenData>(body: Partial<X>, expiresIn = '1d', password = ''): string {
    return jwt.sign({ created: new Date(), roles: [], ...body }, password || this.masterPassword, {
      expiresIn
    });
  }

  generateApiToken<X = ApiTokenData>(body: Partial<X>, expiresIn = '1y'): string {
    return jwt.sign({ created: new Date(), ...body }, this.masterPassword, { expiresIn });
  }

  verify<X = TokenData>(token: string, password = ''): X & TokenData {
    try {
      return jwt.verify(token, password || this.masterPassword);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  checkAuthorized<X = TokenData>(req: GenericRequest): X & TokenData {
    return this.verify(this.getToken(req));
  }

  getToken(req: GenericRequest) {
    let auth = req.headers['Authorization'] || req.headers['authorization'];
    let token = auth?.split(' ')[1] ?? req.query.token;
    return token;
  }

  checkRole(req, ...roles: string[]): TokenData {
    let token = this.checkAuthorized(req);
    let hasRoles = !!token.roles;
    if (token.roles)
      for (let r of roles) {
        hasRoles = hasRoles && token.roles.indexOf(r) >= 0;
      }
    if (!hasRoles) throw new Error(`User ${token?.email} has no roles ${roles.join(',')}`);
    return token;
  }

  roles(req): string[] {
    let token = this.checkAuthorized(req);
    return token.roles || [];
  }

  extractTokenData(request: GenericRequest) {
    const tokenData = this.checkAuthorized<{ tenant: string }>(request);
    if (!tokenData.email)
      throw new HttpException(
        'Could not find tenant on request for token ' + this.getToken(request),
        HttpStatus.FORBIDDEN
      );
    return tokenData;
  }

  extractApiTokenData(request: GenericRequest): ApiTokenData {
    return this.checkAuthorized<{ tenant: string }>(request);
  }

  emailAndRoles(request: GenericRequest) {
    return this.extractTokenData(request);
  }
}

export const tokenService = new TokenService(globalConfig.master_password);
