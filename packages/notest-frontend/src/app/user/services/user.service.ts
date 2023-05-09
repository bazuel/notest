import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { NTUser } from '@notest/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpService) {}

  async getUserById() {
    return await this.http.get<NTUser>('/user/get-user');
  }

  async generateApiToken() {
    return await this.http
      .get<{ api_token: string }>('/user/generate-api-token')
      .then((res) => res.api_token);
  }

  async deleteApiToken() {
    return await this.http.get<string>('/user/delete-api-token');
  }

  async checkPassword(email: string, password: string) {
    return await this.http
      .gest<{ ok: boolean }>('/user/check-password', { email, password })
      .then((res) => res.ok);
  }

  async saveUserInfo(user: NTUser): Promise<NTUser> {
    return await this.http.post('/user/update-user', { user });
  }

  async getApiToken() {
    return await this.http.get<{ apiToken: string }>('/user/get-api-token');
  }
}
