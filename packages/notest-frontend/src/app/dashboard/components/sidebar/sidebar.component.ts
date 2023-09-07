import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../shared/services/token.service';
import { Router } from '@angular/router';
import { NTRoleLabelsMap, NTRolesPriority } from '@notest/common';
import { RolesService } from '../../../notest-shared/services/roles.service';

@Component({
  selector: 'nt-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  fullname = '';
  role = '';
  userid = '';
  ready = false;
  sidebarHover = false;
  roleLabelsMap = NTRoleLabelsMap;
  rolesPriority = NTRolesPriority;

  constructor(
    public tokenService: TokenService,
    private router: Router,
    public rolesService: RolesService
  ) {}

  async ngOnInit() {
    this.fullname =
      this.tokenService.tokenData().name + ' ' + this.tokenService.tokenData().surname;
    this.role = this.tokenService
      .tokenData()
      .roles.sort((a, b) => this.rolesPriority[a] - this.rolesPriority[b])[0];
    this.userid = this.tokenService.tokenData().id;
    this.ready = true;
  }
  logout() {
    this.tokenService.logout();
    window.location.href = '/';
  }

  redirectToUser() {
    this.router.navigateByUrl(`user/settings`);
  }
}
