import { Injectable } from '@angular/core';
import { HttpService } from '../../shared/services/http.service';
import { BLDomEvent, BLSessionEvent, NTRunnerConfig, NTSession } from '@notest/common';

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
      .gest<any[]>(`/session/run-history`, { reference })
      .then((res) =>
        res.sort(
          (a, b) => new Date(b.session.created).getTime() - new Date(a.session.created).getTime()
        )
      );
  }

  rerunSession(reference: string, backendType: NTRunnerConfig['backendType']) {
    return this.http.gest(`/session/run`, { reference, backend_type: backendType });
  }

  updateSessionInfo(session: NTSession) {
    return this.http.post('/session/update-session-info', session);
  }

  async loadNewSession(reference: string, currentSessions: number) {
    return new Promise<any[]>((resolve) => {
      const interval = setInterval(async () => {
        const sessions = await this.getSessionRunHistory(reference);
        console.log('waiting for new session', currentSessions, sessions);
        if (sessions.length > currentSessions) {
          clearInterval(interval);
          resolve(sessions);
        }
      }, 1000);
    });
  }

  async waitForReference(reference: string) {
    return await this.loadNewSession(reference, 0);
  }

  async loadFullDom(fullDomId: string) {
    return this.http.gest<BLDomEvent>(`/session/shot`, {
      id: fullDomId
    });
  }
}
