import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class IsAdmin implements CanActivate {
  constructor(private tokenService: TokenService) {}
  canActivate() {
    try {
      return this.tokenService.hasRole('ADMIN');
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
