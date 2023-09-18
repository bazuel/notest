import { Injectable } from '@angular/core';
import { TokenService } from '../../shared/services/token.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  constructor(private tokenService: TokenService) {}

  get isAdmin() {
    return this.tokenService.hasRole('ADMIN');
  }

  get isDev() {
    return this.tokenService.hasRole('DEVELOPER');
  }

  get isUser() {
    return this.tokenService.hasRole('USER');
  }
}
