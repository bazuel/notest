import { Component, HostListener, OnInit } from '@angular/core';
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
  changingPassword = false;

  newPassword = '';

  userInfoUpdated = false;

  showSaveButton = false;
  showChangePassword = false;

  copyToClipboard = copyToClipboard;

  saving = false;
  newUser = false;

  error = false;
  errorMessage = '';

  passwordError = false;
  passwordErrorMessage = '';

  success = false;
  passwordSuccess = false;

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
  }

  @HostListener('click')
  @HostListener('keyup')
  controlChanges() {
    this.showSaveButton =
      this.error || JSON.stringify(this.initialUser) !== JSON.stringify(this.user);
    this.showChangePassword = this.passwordError || this.canSavePassword();
  }

  async generateApiToken() {
    this.user.api_token = await this.userService.generateApiToken();
  }

  async deleteToken() {
    this.user.api_token = '';
    await this.userService.deleteApiToken();
  }

  async changePassword() {
    this.changingPassword = true;
    this.currentPasswordMatch = await this.checkCurrentPassword();
    if (!this.currentPasswordMatch) {
      this.onChangePasswordError('Current password is not correct.');
      return;
    }
    if (this.newPassword !== this.newPasswordRepeated) {
      this.onChangePasswordError('New passwords do not match.');
      return;
    }
    const success = await this.authService.resetPassword(
      this.tokenService.get()!,
      this.newPassword
    );
    if (success) this.onChangePasswordSuccess();
  }

  async saveUser() {
    this.saving = true;
    if (!this.user.email) {
      this.onSaveUserError('Email is required.');
      return;
    }
    if (!this.user.nt_userid && !this.newPassword) {
      this.onSaveUserError('A new password is required for new users.');
      return;
    }
    if (!this.user.nt_userid && this.newPassword && this.newPassword !== this.newPasswordRepeated) {
      this.onSaveUserError('Passwords do not match.');
      return;
    }
    if (this.newUser) this.user.password = this.newPassword;
    const user = await this.userService.save(this.user);
    if (user) {
      this.user = user;
      this.initialUser = structuredClone(this.user);
      this.saving = false;
      if (this.newUser) {
        this.newUser = false;
        this.newPassword = '';
        this.newPasswordRepeated = '';
        this.location.replaceState(`/user/user-form?id=${this.user.nt_userid}`);
      }
      this.onSaveUserSuccess();
    }
  }

  onSaveUserError(message: string) {
    this.controlChanges();
    this.saving = false;
    this.error = true;
    this.errorMessage = message;
    setTimeout(() => {
      this.error = false;
      this.saving = false;
    }, 3000);
  }

  onSaveUserSuccess() {
    this.controlChanges();
    this.saving = false;
    this.success = true;
    setTimeout(() => {
      this.success = false;
      this.saving = false;
    }, 3000);
  }

  onChangePasswordSuccess() {
    this.controlChanges();
    this.currentPassword = '';
    this.newPassword = '';
    this.newPasswordRepeated = '';
    this.passwordSuccess = true;
    setTimeout(() => {
      this.passwordSuccess = false;
      this.changingPassword = false;
      this.showSaveButton = false;
    }, 3000);
  }

  onChangePasswordError(message: string) {
    this.controlChanges();
    this.passwordError = true;
    this.passwordErrorMessage = message;
    setTimeout(() => {
      this.passwordError = false;
      this.changingPassword = false;
    }, 3000);
  }

  async checkCurrentPassword() {
    return await this.userService.checkPassword(this.user.email, this.currentPassword!);
  }

  toggleRole(value: NTRole) {
    toggle(value, this.user.roles);
  }

  private canSavePassword() {
    const newPasswords = !!this.newPassword && !!this.newPasswordRepeated;
    return !this.newUser && newPasswords;
  }
  protected readonly NTRoleMap = NTRoleMap;

  protected readonly NTRoleLabelsMap = NTRoleLabelsMap;
}
