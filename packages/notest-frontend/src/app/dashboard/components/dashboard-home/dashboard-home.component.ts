import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'nt-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent {
  constructor(private router: Router) {}

  redirectSessionDashboard() {
    this.router.navigateByUrl('session/session-dashboard');
  }
}
