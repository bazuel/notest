import { Component, ViewChild } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { UrlParamsService } from '../../../shared/services/url-params.service';
import { debounce, NTAssertion, NTMedia, NTRunnerConfig, NTSession } from '@notest/common';
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
  backendType: NTRunnerConfig['backendType'] = 'full';
  sessionRunHistory!: {
    session: NTSession;
    screenshot: NTMedia[];
    video: NTMedia;
    assertions: NTAssertion[];
    showInfo: boolean;
  }[];
  screenshotOnHover?: NTMedia;
  videoReference?: string;
  sessionOnHover?: NTSession;
  loading = false;
  fullLoading = false;
  showSessionSettings = false;
  showAssertionPopup: boolean = false;
  sessionDomain = { domain: '', ssl: false, port: '' };
  runSelected?: {
    session: NTSession;
    screenshot: NTMedia[];
    video: NTMedia;
    assertions: NTAssertion[];
    showInfo: boolean;
  };

  videoLoaded = false;

  constructor(
    private sessionService: SessionService,
    private urlParamsService: UrlParamsService,
    private router: Router
  ) {}

  async ngOnInit() {
    const rerunStorage = await this.initSessionInfo();
    if (this.sessionRunHistory?.length == 0) {
      this.fullLoading = true;
      this.sessionRunHistory = await this.sessionService.loadNewSession(this.reference, 0);
      this.fullLoading = false;
    }
    this.videoReference = this.sessionRunHistory[0].session.reference;
    if (rerunStorage.loading && rerunStorage.reference === this.reference) {
      await this.waitForSessionLoaded(rerunStorage.currentSessions);
    }
  }

  private async initSessionInfo() {
    this.reference = this.urlParamsService.get('reference')!;
    this.session = await this.sessionService.getSessionByReference(this.reference);
    this.sessionDomain.ssl = this.session.url.includes('https://');
    this.sessionDomain.domain = new URL(this.session.url).hostname;
    this.sessionDomain.port = new URL(this.session.url).port;
    this.getLoginSessionItem();
    const rerunStorage = JSON.parse(localStorage.getItem('rerun') || '{}');
    this.backendType = rerunStorage.backendType || 'full';
    this.sessionRunHistory = await this.sessionService.getSessionRunHistory(this.reference);
    return rerunStorage;
  }

  private async waitForSessionLoaded(currentSessions: number) {
    this.loading = true;
    this.sessionRunHistory = await this.sessionService.loadNewSession(
      this.reference,
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
    this.loginSessionSelected = this.loginSessions.find(
      (s) => s.reference == this.session.info.loginReference
    );
  }

  async rerunSession() {
    const rerunUrl =
      (this.sessionDomain.ssl ? 'https://' : 'http://') +
      this.sessionDomain.domain +
      (this.sessionDomain.port ? ':' + this.sessionDomain.port : '');
    this.sessionService.rerunSession(this.reference, this.backendType, rerunUrl);
    localStorage.setItem(
      'rerun',
      JSON.stringify({
        currentSessions: this.sessionRunHistory.length,
        reference: this.reference,
        loading: true,
        backendType: this.backendType
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
      setTimeout(() => this.video?.play(0), 100);
    }, 10);
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
    //TODO mandiamo l'informazione nel messaggio al runner
    if (loginSession) {
      this.session.info.loginReference = loginSession.reference;
      await this.setIsLoginSessionState(false);
      this.backendType = 'full';
    } else {
      this.session.info.loginReference = undefined;
    }
    this.loginSessionSelected = loginSession;
    await this.updateSession();
  }

  async updateSession() {
    await this.sessionService.updateSessionInfo(this.session);
  }

  async setIsLoginSessionState(isLogin: boolean) {
    //TODO mandiamo l'informazione nel messaggio al runner
    this.session.info.isLogin = isLogin;
    if (isLogin && this.loginSessionSelected) {
      await this.setLoginReference(undefined);
    }
    await this.sessionService.updateSessionInfo(this.session);
  }

  goToDebugger() {
    const debuggerLink = this.router.url.replace('preview', 'debugger');
    this.router.navigateByUrl(debuggerLink);
  }

  async toggleBackendType() {
    this.backendType = this.backendType === 'full' ? 'mock' : 'full';
    if (this.backendType === 'mock') await this.setLoginReference(undefined);
  }

  debouncedSaveSession = debounce(async () => this.updateSession(), 1000);
}
