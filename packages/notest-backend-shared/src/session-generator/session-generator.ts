import { SessionExecutor } from '../session-executor/session-executor';
import { BLCookieDetailsEvent, BLSessionEvent, BLWindowResizeEvent } from '@notest/common';
import { Project, SourceFile } from 'ts-morph';
import { getInitTestSampleCode } from './functions/get-init-test-stample';
import { getAddCookies } from './functions/get-add-cookies';
import { findEventsByName } from '../shared/functions/find-events-by-name';
import { actionWhitelists, generateStatement, setMode } from './statement-generator';
import { getAddInitScript } from './functions/get-add-init-script';

export class SessionGenerator extends SessionExecutor {
  project: Project;
  private file: SourceFile;
  private lastEvent?: BLSessionEvent;

  constructor() {
    super();
    this.project = new Project({ tsConfigFilePath: 'tsconfig.json' });
    this.file = this.project.createSourceFile('session.spec.ts', '');
  }

  async init(config: { mode: string }, session: BLSessionEvent[]) {
    setMode(config.mode as 'local' | 'remote');
    const testTimeout = session[session.length - 1].timestamp - session[0].timestamp + 10000;
    const { width, height } = findEventsByName<BLWindowResizeEvent>(session, 'resize');
    this.file.addStatements(getInitTestSampleCode(testTimeout, { width, height }));
    const cookieEvent = findEventsByName<BLCookieDetailsEvent>(session, 'cookie-details');
    if (cookieEvent) this.file.addStatements(getAddCookies(cookieEvent.details));
    this.file.addStatements(`test('session-${session[0].timestamp}', async () => {`);
    this.file.addStatements(getAddInitScript(session));
  }

  executeEvent(index: number, session: BLSessionEvent[], event: BLSessionEvent) {
    if (actionWhitelists.includes(event.name)) {
      let timeout = this.lastEvent ? event.timestamp - this.lastEvent.timestamp : 0;
      if (timeout < 5) timeout = 200;
      this.lastEvent = event;
      this.file.addStatements(`await page.waitForTimeout(${timeout});`);
      this.file.addStatements(generateStatement[event.name]!(event));
    }
  }

  async end() {
    this.file.addStatements('});');
    this.file.formatText();
    return this.file.getFullText();
  }
}
