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
}
