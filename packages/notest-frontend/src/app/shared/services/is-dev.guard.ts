import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { TokenService } from './token.service';

@Injectable()
export class IsDeveloper implements CanActivate {
  constructor(private tokenService: TokenService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      return this.tokenService.hasRole('DEVELOPER');
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
