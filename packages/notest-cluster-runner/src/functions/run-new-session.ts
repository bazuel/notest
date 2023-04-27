import { BLSessionEvent, NTRunnerConfig, NTScreenshot } from '@notest/common';
import { SessionRunner } from 'notest-backend-shared';

export async function runLoginSession(eventList: BLSessionEvent[], sessionDomain: string) {
  console.log('Login phase started');
  const sessionRunner = new SessionRunner();
  const result = await sessionRunner.run<NTRunnerConfig, { events: BLSessionEvent[] }>(eventList, {
    backendType: 'full',
    sessionDomain,
    isLoginSession: true
  });
  console.log('Login phase ended');
  return result.events;
}

export async function runSession(
  eventList: BLSessionEvent[],
  domain: string,
  backendType: 'mock' | 'full',
  loginEvents: BLSessionEvent[]
) {
  const monitoringSession = await runMonitoringSession(eventList, domain, backendType, loginEvents);
  const screenshotSession = await runScreenshotSession(eventList, domain, backendType, loginEvents);
  return { monitoringSession, screenshotSession };
}

async function runMonitoringSession(
  eventList: BLSessionEvent[],
  sessionDomain: string,
  backendType: 'mock' | 'full',
  loggedStoragesAndCookie: BLSessionEvent[]
) {
  console.log('Monitoring phase started');
  const sessionRunner = new SessionRunner();

  const result = await sessionRunner.run<NTRunnerConfig, MonitoringReturnType>(eventList, {
    backendType,
    sessionDomain,
    monitoring: true,
    recordVideo: true,
    loginEvents: loggedStoragesAndCookie
  });
  console.log('Monitoring phase ended');
  return result;
}

async function runScreenshotSession(
  eventList: BLSessionEvent[],
  sessionDomain: string,
  backendType: 'mock' | 'full',
  loggedStoragesAndCookie: BLSessionEvent[]
) {
  console.log('Screenshot phase started');
  const sessionRunner = new SessionRunner();
  const result = await sessionRunner.run<NTRunnerConfig, ScreenshotReturnType>(eventList, {
    backendType,
    sessionDomain,
    takeScreenshot: true,
    loginEvents: loggedStoragesAndCookie
  });
  console.log('Screenshot phase ended');
  return result;
}

type MonitoringReturnType = {
  events: BLSessionEvent[];
  testFailed: boolean;
  lastEvent: BLSessionEvent;
  videoPath: string;
};

type ScreenshotReturnType = {
  screenshotList: NTScreenshot[];
  startVideoTimeStamp: Date;
};
