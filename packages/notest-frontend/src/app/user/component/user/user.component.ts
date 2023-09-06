import { Component, OnInit } from '@angular/core';
import {
  copyToClipboard,
  NTRole,
  NTRoleLabelsMap,
  NTRoleMap,
  NTUser,
  toggle
} from '@notest/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../../auth/services/auth.service';
import { TokenService } from '../../../shared/services/token.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';
import { Location } from '@angular/common';

@Component({
  selector: 'nt-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  initialUser!: NTUser;
  user!: NTUser;
  currentPassword?: string;
  newPasswordRepeated?: string;
  passwordUpdated = false;
  currentPasswordMatch = true;

  newPassword = '';

  userInfoUpdated = false;

  showSaveButton = false;
  showChangePassword = false;

  copyToClipboard = copyToClipboard;

  saving = false;
  newUser = false;
  error = false;
  errorMessage = '';

  constructor(
    private location: Location,
    private userService: UserService,
    private authService: AuthService,
    public tokenService: TokenService,
    private urlParamsService: UrlParamsService
  ) {}

  @ShowFullScreenLoading()
  async ngOnInit() {
    const userid = this.urlParamsService.get('id');
    this.newUser = !userid;
    if (userid) this.user = await this.userService.getUserById(userid);
    else this.user = { domains: [], roles: [] } as any;
    this.initialUser = structuredClone(this.user);
    setInterval(() => {
      this.showSaveButton = JSON.stringify(this.initialUser) !== JSON.stringify(this.user);
      this.showChangePassword = this.canSavePassword();
    }, 100);
  }

  async generateApiToken() {
    this.user.api_token = await this.userService.generateApiToken();
  }

  async deleteToken() {
    this.user.api_token = '';
    await this.userService.deleteApiToken();
  }

  async changePassword() {
    const token = this.tokenService.get();
    this.saving = true;
    this.currentPasswordMatch = await this.checkCurrentPassword();
    if (!this.currentPasswordMatch) {
      this.error = true;
      this.errorMessage = 'Current password is not correct.';
      return;
    }
    if (this.newPassword !== this.newPasswordRepeated) {
      this.error = true;
      this.errorMessage = 'New passwords do not match.';
      return;
    }
    if (token && this.newPassword) {
      const result = await this.authService.resetPassword(token, this.newPassword);
      if (result) {
        this.showChangePassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.newPasswordRepeated = '';
        this.saving = false;
      }
    }
  }

  async saveUser() {
    this.error = false;
    if (!this.user.nt_userid && (!this.newPassword || !this.user.email)) {
      this.error = true;
      this.errorMessage = 'Email and password are required for new users.';
      return;
    }
    if (this.newPassword && this.newPassword !== this.newPasswordRepeated) {
      this.error = true;
      this.errorMessage = 'New passwords do not match.';
      return;
    }
    this.saving = true;
    if (this.newUser) this.user.password = this.newPassword;
    const user = await this.userService.save(this.user);
    if (user) {
      this.user = user;
      this.initialUser = structuredClone(this.user);
      this.saving = false;
      this.showSaveButton = false;
      if (this.newUser) this.location.replaceState(`/user/user-form?id=${this.user.nt_userid}`);
    }
  }

  async checkCurrentPassword() {
    return await this.userService.checkPassword(this.user.email, this.currentPassword!);
  }

  toggleRole(value: NTRole) {
    toggle(value, this.user.roles);
  }

  protected readonly NTRoleMap = NTRoleMap;
  protected readonly NTRoleLabelsMap = NTRoleLabelsMap;

  private canSavePassword() {
    const newPasswords = !!this.newPassword && !!this.newPasswordRepeated;
    return !this.newUser && newPasswords;
  }
}
