import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { UrlParamsService } from './url-params.service';

@Injectable()
export class CatchToken implements CanActivate {
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private urlParamsService: UrlParamsService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const isTokenExpired = this.tokenService.isExpired();
      const urlToken = this.urlParamsService.get<{ token: string }>('token');
      if (isTokenExpired && urlToken) {
          this.tokenService.set(urlToken);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
