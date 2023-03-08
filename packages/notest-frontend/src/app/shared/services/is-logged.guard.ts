import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { UrlParamsService } from './url-params.service';

@Injectable()
export class IsLogged implements CanActivate {
  lastUrl = 'last_url';

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private urlParamsService: UrlParamsService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const isTokenExpired = this.tokenService.isExpired();
      const urlToken = this.urlParamsService.get<{ token: string }>('token');
      if (isTokenExpired) {
        if (urlToken) {
          this.tokenService.set(urlToken);
          return true;
        }
        sessionStorage.setItem(this.lastUrl, window.location.href);
        await this.router.navigateByUrl('auth/login');
      }
      return !isTokenExpired;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
