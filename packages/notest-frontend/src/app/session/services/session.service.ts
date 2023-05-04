import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import {
  BLDomEvent,
  BLSessionEvent,
  NTAssertion,
  NTMedia,
  NTRunnerConfig,
  NTSession
} from '@notest/common';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(private http: HttpService) {}

  async getEventsByReference(reference: string | undefined) {
    if (!reference) throw new Error('Reference is required');
    return await this.http.gest<BLSessionEvent[]>(`/session/download`, { reference });
  }

  async getSessionByReference(reference: string | undefined) {
    if (!reference) throw new Error('Reference is required');
    return await this.http.gest<NTSession>(`/session/find-by-reference`, { reference });
  }

  async getSessionTest(reference: string) {
    return await this.http
      .gest<{ ok: boolean; script: string }>(`/generator/generate-session-test`, { reference })
      .then((res) => res.script);
  }

  getSessionsByUrl(url: string) {
    return this.http.gest<{ session: BLSessionEvent[]; reference: string }[]>(
      `/session/find-by-url`,
      { url }
    );
  }

  async getSessionsByUserid() {
    return this.http.gest<{ sessions: NTSession[] }>(`/session/find-by-userid`, {});
  }

  async getLoginSessions(domain = '') {
    return this.http.gest<NTSession[]>(`/session/login-sessions`, { domain });
  }

  async getSessionRunHistory(reference: string) {
    return this.http
      .gest<any[]>(`/session/get-run-history`, { reference })
      .then((res) =>
        res.sort(
          (a, b) => new Date(b.session.created).getTime() - new Date(a.session.created).getTime()
        )
      );
  }

  async getSessionBatteryRunHistory(references: string[]) {
    this.http
      .gest<any[]>(`/session/get-battery-run-history`, { references })
      .then((res) =>
        res.sort(
          (a, b) => new Date(b.session.created).getTime() - new Date(a.session.created).getTime()
        )
      );
    return null as unknown as {
      sessions: {
        session: NTSession;
        assertions: NTAssertion[];
        screenshot: NTMedia[];
        video: NTMedia;
        showInfo: boolean;
      }[];
    }[];
  }

  async getRerunSessions(reference: string) {
    return this.http.gest<number>(`/session/get-rerun-session`, { reference });
  }

  rerunSession(
    reference: string,
    backend_type: NTRunnerConfig['backendType'],
    session_domain: string
  ) {
    return this.http.gest(`/session/run`, {
      reference,
      backend_type,
      session_domain
    });
  }

  updateSessionInfo(session: NTSession) {
    return this.http.post('/session/update-session-info', session);
  }

  async loadNewSession(reference: string, currentSessions: number) {
    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        const rerunSessions = await this.getRerunSessions(reference);
        console.log('waiting for new session', currentSessions, rerunSessions);
        console.log(rerunSessions);
        if (rerunSessions > currentSessions) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
    return await this.getSessionRunHistory(reference);
  }

  async loadFullDom(fullDomId: string) {
    return this.http.gest<BLDomEvent>(`/session/shot`, { id: fullDomId });
  }
}
