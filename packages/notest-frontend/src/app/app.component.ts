import { Component } from '@angular/core';
import { LoadingService } from './shared/services/loading.service';
import { TokenService } from './shared/services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'nt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'notest-frontend';
  pathClass: string = '';
  constructor(
    public loadingService: LoadingService,
    public tokenService: TokenService,
    private router: Router
  ) {
    router.events.subscribe(() => {
      this.pathClass = 'path' + window.location.pathname.replace(/\//gi, '-');
      console.log(this.pathClass);
    });
  }
}
