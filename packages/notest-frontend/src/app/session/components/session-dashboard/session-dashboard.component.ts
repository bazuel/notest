import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { NTSession } from '@notest/common';
import { Router } from '@angular/router';
import { ShowFullScreenLoading } from '../../../shared/services/loading.service';

@Component({
  selector: 'nt-session-dashboard',
  templateUrl: './session-dashboard.component.html',
  styleUrls: ['./session-dashboard.component.scss']
})
export class SessionDashboardComponent implements OnInit {
  sessionList: NTSession[] = [];
  loginSessionList: NTSession[] = [];

  constructor(private sessionService: SessionService, private router: Router) {}

  @ShowFullScreenLoading()
  async ngOnInit() {
    this.sessionList = (await this.sessionService.getSessionsByUserid()).sessions.filter(
      (session) => !session.info.isLogin
    );
    this.loginSessionList = await this.sessionService.getLoginSessions();
  }

  redirectToDebugger(reference: string) {
    this.router.navigateByUrl(`session/session-debugger?reference=${reference}`);
  }
  redirectToPreview(reference: string) {
    this.router.navigateByUrl(`session/session-preview?reference=${reference}`);
  }

  redirectToComparator(reference) {
    this.router.navigateByUrl(`session/session-comparator?ref1=${reference}&ref2=${reference}`);
  }
}
