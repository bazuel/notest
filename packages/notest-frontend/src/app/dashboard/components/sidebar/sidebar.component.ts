import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../shared/services/token.service';
import { Router } from '@angular/router';

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

  constructor(private tokenService: TokenService, private router: Router) {}

  async ngOnInit() {
    this.fullname =
      this.tokenService.tokenData().name + ' ' + this.tokenService.tokenData().surname;
    this.role = this.tokenService.tokenData().roles[0] ?? '';
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
