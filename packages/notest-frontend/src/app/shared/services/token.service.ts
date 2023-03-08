import { Injectable } from '@angular/core';
import 'dayjs/locale/it';
import dayjs from 'dayjs'; // load on demand

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  static TOKEN = 'NOTEST_TOKEN';
  static TOKEN_TEMP = 'NOTEST_TOKEN_TEMP';

  constructor() {}

  get temporaryToken() {
    return localStorage.getItem(TokenService.TOKEN_TEMP);
  }

  has() {
    return (
      sessionStorage.getItem(TokenService.TOKEN) != null ||
      localStorage.getItem(TokenService.TOKEN) != null
    );
  }

  get() {
    return sessionStorage.getItem(TokenService.TOKEN) || localStorage.getItem(TokenService.TOKEN);
  }

  set(token: string) {
    localStorage.setItem(TokenService.TOKEN, token);
  }

  setTemporaryToken(token: string) {
    localStorage.setItem(TokenService.TOKEN_TEMP, localStorage.getItem(TokenService.TOKEN)!);
    sessionStorage.setItem(TokenService.TOKEN, token);
  }

  restoreTemporaryToken() {
    if (!localStorage.getItem(TokenService.TOKEN_TEMP)) throw new Error('Token not available');
    this.set(localStorage.getItem(TokenService.TOKEN_TEMP)!);
    localStorage.removeItem(TokenService.TOKEN_TEMP);
    sessionStorage.removeItem(TokenService.TOKEN);
  }

  hasRole(roleName: string) {
    const roles = this.roles();
    return roles.indexOf(roleName) >= 0;
  }

  roles(): string[] {
    const tdata = this.tokenData();
    const roles = tdata && tdata.roles ? tdata.roles : [];
    return roles;
  }

  isImpersonated() {
    return !!this.impersonatedBy();
  }

  impersonatedBy() {
    let impersonating = '';
    if (localStorage.getItem(TokenService.TOKEN_TEMP))
      impersonating = this.tokenData(localStorage.getItem(TokenService.TOKEN_TEMP)!)?.sub;
    return impersonating;
  }

  logout() {
    localStorage.removeItem(TokenService.TOKEN);
    localStorage.removeItem(TokenService.TOKEN_TEMP);
    sessionStorage.removeItem(TokenService.TOKEN);
  }

  username(): string | undefined {
    return this.tokenData()?.sub;
  }

  isExpired(): boolean {
    const token = this.tokenData();
    if (token) {
      const tokenExp = dayjs(token.exp * 1000);
      return dayjs().isAfter(tokenExp);
    }
    return true;
  }

  tokenData(token?: string): any {
    const t = token ?? this.get();
    const tdata = t ? JSON.parse(atob(t!.split('.')[1])) : null;
    return tdata;
  }

  get logged() {
    return !this.isExpired();
  }
}
