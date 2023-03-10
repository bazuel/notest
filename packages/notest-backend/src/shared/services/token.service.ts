import { Injectable } from '@nestjs/common';

const jwt = require('jsonwebtoken');

export class TokenData {
  id: any;
  created: string;
  email: string;
  tenant?: string;
  exp: number;
  iat: number;
  roles?: string[];
}

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

  verify<X = TokenData>(token: string, password = ''): X & TokenData {
    try {
      return jwt.verify(token, password || this.masterPassword);
    } catch (err) {
      throw new Error('Invalid token');
    }
  }

  checkAuthorized<X = TokenData>(req: GenericRequest): X & TokenData {
    return this.verify(this.get(req));
  }

  get(req: GenericRequest) {
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
}
