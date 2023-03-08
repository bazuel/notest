import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { TokenService } from '../../../shared/services/token.service';

@Component({
  selector: 'nt-success',
  template: `
    <div class="bo-section shadow-2xl">
      <div class="my-2">
        <nt-logo>Registration success</nt-logo>
        <div>
          Congratulations, your account has been successfully created, you can close this page!
        </div>
      </div>
    </div>
  `
})
export class RegistrationSuccessComponent implements OnInit {
  constructor(
    private urlParamsService: UrlParamsService,
    private tokenService: TokenService,
    private router: Router
  ) {}
  async ngOnInit() {
    const token = this.urlParamsService.get('token');
    if (!token) {
      await this.router.navigateByUrl('auth/login');
      return;
    }
    this.tokenService.set(token);
    if (this.tokenService.isExpired()) await this.router.navigateByUrl('auth/login');
    return;
  }
}
