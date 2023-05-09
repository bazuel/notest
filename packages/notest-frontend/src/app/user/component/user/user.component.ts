import { Component, OnInit } from '@angular/core';
import { copyToClipboard, NTUser } from '@notest/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { TokenService } from '../../../shared/services/token.service';

@Component({
  selector: 'nt-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user!: NTUser;
  currentPassword?: string;
  newPassword?: string;
  newPasswordRepeated?: string;
  passwordUpdated = false;
  checkCurrentPass = true;
  userInfoUpdated = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}

  async ngOnInit() {
    this.user = await this.userService.getUserById();
  }

  async generateApiToken() {
    this.user.api_token = await this.userService.generateApiToken();
  }

  async deleteToken() {
    this.user.api_token = '';
    await this.userService.deleteApiToken();
  }

  async changePassword() {
    let res = false;
    const token = this.tokenService.get();
    this.checkCurrentPass = await this.checkCurrentPassword();
    if (token && this.checkCurrentPass)
      res = await this.authService.resetPassword(token, this.newPasswordRepeated!);
    if (res) {
      this.passwordUpdated = true;
      setTimeout(() => {
        this.passwordUpdated = false;
      }, 2000);
    }
  }

  async saveUserInformation() {
    const user = await this.userService.saveUserInfo(this.user);
    if (user) {
      this.userInfoUpdated = true;
      setTimeout(() => {
        this.userInfoUpdated = false;
      }, 2000);
    }
  }

  async checkCurrentPassword() {
    return await this.userService.checkPassword(this.user.email, this.currentPassword!);
  }

  protected readonly copyToClipboard = copyToClipboard;
}
