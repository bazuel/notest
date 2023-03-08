import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { NTUser } from '@notest/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpService) {}

  login(email: string, password: string) {
    return this.http.post(`/user/login`, { email, password });
  }

  forgotPassword(email: string) {
    return this.http.post(`/user/forgot-password`, {
      email
    });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(`/user/reset-password`, { token, password });
  }

  signIn(user: NTUser): Promise<{ ok: boolean }> {
    return this.http.post(`/user/request-registration`, user);
  }
}
