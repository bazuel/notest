import { Component, ViewChild } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { NTAssertion, NTMedia, NTSession } from '@notest/common';
import { TokenService } from '../../../shared/services/token.service';
import { VideoComponent } from '../../../notest-shared/components/video/video.component';
import { Router } from '@angular/router';

@Component({
  selector: 'nt-session-preview',
  templateUrl: './session-preview.component.html',
  styleUrls: ['./session-preview.component.scss']
})
export class SessionPreviewComponent {
  @ViewChild('video') video?: VideoComponent;
  session!: NTSession;
  reference!: string;
  loginSessions: { title: string; reference: string }[] = [];
  loginSessionSelected?: { title: string; reference: string };
  sessionRunHistory!: {
    session: NTSession;
    screenshot: NTMedia[];
    video: NTMedia;
    assertion: NTAssertion;
  }[];
  screenshotOnHover?: NTMedia;
  videoReference?: string;
  sessionOnHover?: NTSession;
  loading = false;
  fullLoading = false;
  userLogged = false;

  constructor(
    private sessionService: SessionService,
    private urlParamsService: UrlParamsService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.userLogged = this.tokenService.logged;
    this.reference = this.urlParamsService.get('reference')!;
    this.session = await this.sessionService.getSessionByReference(this.reference);
    this.getLoginSessionItem();
    const rerunStorage = JSON.parse(localStorage.getItem('rerun') || '{}');
    this.sessionRunHistory = await this.sessionService.getSessionRunHistory(this.session.reference);
    if (this.sessionRunHistory.length === 0) {
      this.fullLoading = true;
      this.sessionRunHistory = await this.sessionService.waitForReference(this.session.reference);
      this.fullLoading = false;
    }
    this.sessionRunHistory.forEach((sessionRun) => sessionRun.screenshot);
    this.videoReference = this.sessionRunHistory[0].session.reference;
    if (rerunStorage.loading && rerunStorage.reference === this.reference) {
      this.waitForSessionLoaded(rerunStorage.currentSessions);
    }
  }

  private async waitForSessionLoaded(currentSessions: number) {
    this.loading = true;
    this.sessionRunHistory = await this.sessionService.loadNewSession(
      encodeURIComponent(this.reference),
      currentSessions
    );
    this.loading = false;
    localStorage.setItem(
      'rerun',
      JSON.stringify({
        currentSessions: this.sessionRunHistory.length,
        reference: this.reference,
        loading: false
      })
    );
  }

  async getLoginSessionItem() {
    const loginSessions = await this.sessionService.getLoginSessions(
      new URL(this.session.url).hostname
    );
    this.loginSessions = loginSessions.map((session) => {
      return { title: session.info.title, reference: session.reference };
    });
    this.loginSessionSelected = await this.loginSessions.find(
      (loginSession) => loginSession.reference == this.session.info.loginReference
    );
  }

  async rerunSession() {
    this.sessionService.rerunSession(this.reference);
    localStorage.setItem(
      'rerun',
      JSON.stringify({
        currentSessions: this.sessionRunHistory.length,
        reference: this.reference,
        loading: true
      })
    );
    this.waitForSessionLoaded(this.sessionRunHistory.length);
  }

  showImage(screenShot: NTMedia) {
    this.screenshotOnHover = screenShot;
  }

  hideImage() {
    this.screenshotOnHover = undefined;
  }

  showVideo(reference: string) {
    this.videoReference = undefined;
    setTimeout(() => {
      this.videoReference = reference;
    }, 10);
    setTimeout(() => {
      this.video?.play(0);
    }, 100);
  }

  setSessionHover(session?: NTSession) {
    this.sessionOnHover = session;
  }

  goToVideo(reference: string, screenshotTime: Date, videoStartTime: Date) {
    console.log((new Date(screenshotTime).getTime() - new Date(videoStartTime).getTime()) / 1000);
    this.screenshotOnHover = undefined;
    this.videoReference = undefined;
    setTimeout(() => {
      this.videoReference = reference;
    }, 10);
    setTimeout(() => {
      this.video?.play(
        (new Date(screenshotTime).getTime() - new Date(videoStartTime).getTime()) / 1000
      );
    }, 100);
  }

  async setLoginReference(loginSession?: (typeof this.loginSessions)[number]) {
    if (loginSession) this.session.info.loginReference = loginSession.reference;
    else this.session.info.loginReference = undefined;
    this.loginSessionSelected = loginSession;
    await this.sessionService.updateSession(this.session);
  }

  goTo() {
    const debuggerLink = this.router.url.replace('preview', 'debugger');
    this.router.navigateByUrl(debuggerLink);
  }
}
