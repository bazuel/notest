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

  async resetPassword(token: string, password: string): Promise<boolean> {
    return await this.http
      .post<{ ok: boolean }>(`/user/reset-password`, { token, password })
      .then((res) => res.ok);
  }

  signIn(user: NTUser): Promise<{ ok: boolean }> {
    return this.http.post(`/user/request-registration`, user);
  }
}
