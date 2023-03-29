import {
  BLSessionEvent,
  eventReference,
  JsonCompressor,
  NTAssertion,
  NTClusterMessage,
  NTRunnerConfig,
  NTSession
} from '@notest/common';
import * as fs from 'fs';
import { runNewSession } from '../functions/run-new-session';
import { assertionService } from 'notest-backend-shared';
import { mediaService } from 'notest-backend-shared';
import { sessionService } from 'notest-backend-shared';
import { EachMessagePayload } from 'kafkajs';

export class ClusterRunnerService {
  private configuration: NTRunnerConfig = {} as any;

  async runMessage(messagePayload: EachMessagePayload) {
    if (messagePayload.message.size == 0) return;
    const timer = setInterval(() => messagePayload.heartbeat(), 5000);
    try {
      //get Event List from reference
      console.log('Session Started');

      const { reference, backendType, sessionDomain } = JSON.parse(
        messagePayload.message.value.toString()
      ) as NTClusterMessage;

      let eventList = await sessionService.read(reference);
      if (!eventList.length) return;

      //login session
      const loginEventList = await sessionService.getLoginReference(reference);
      if (loginEventList) {
        console.log('Login phase started');
        const loginResult = await this.runSessionWithConfiguration(loginEventList, {
          login: true,
          backendType: 'full',
          sessionDomain
        });
        this.configuration.loginEvent = loginResult.events;
        console.log('Login phase ended');
      }
      //Execute Event List
      const { events, testFailed, lastEvent, videoPath } = await this.runSessionWithConfiguration(
        eventList,
        {
          monitoring: true,
          recordVideo: true,
          backendType,
          sessionDomain
        }
      );
      const { screenshotList, startVideoTimeStamp } = await this.runSessionWithConfiguration(
        eventList,
        {
          takeScreenshot: true,
          backendType,
          sessionDomain
        }
      );
      //Save Results and Clean
      const newReference = eventReference(events[0]);
      const newSession = { reference: newReference } as NTSession;
      const newEventsZipped = (await new JsonCompressor().zip(events)) as Buffer;
      await sessionService.save(newEventsZipped, newSession);
      const assertion = this.generateRunAssertion(
        encodeURIComponent(reference),
        eventReference(events[0]),
        testFailed,
        lastEvent,
        false,
        backendType,
        !!loginEventList,
        assertionService.compareHttpRequest(eventList,events)
      );
      await mediaService.saveScreenshot(screenshotList, newReference).catch((e) => {
        console.log('Failed to upload Screenshot', e);
        assertion.info.execution_error = true;
      });
      await mediaService.saveVideo(newReference, startVideoTimeStamp, videoPath).catch((e) => {
        console.log('Failed to upload Video', e);
        assertion.info.execution_error = true;
      });
      await assertionService.save(assertion);
      await this.clearFilesSaved();
      console.log('Session Ended');
      clearInterval(timer);
    } catch (e) {
      clearInterval(timer);
      console.log(
        `Error: Session not found reference: ${messagePayload.message.value.toString()}`,
        e
      );
      await this.clearFilesSaved();
    }
  }

  private async runSessionWithConfiguration(
    eventList: BLSessionEvent[],
    {
      takeScreenshot = false,
      login = false,
      monitoring = false,
      recordVideo = false,
      backendType,
      sessionDomain
    }: NTRunnerConfig
  ) {
    this.configuration.monitoring = monitoring;
    this.configuration.recordVideo = recordVideo;
    this.configuration.login = login;
    this.configuration.takeScreenshot = takeScreenshot;
    this.configuration.backendType = backendType;
    this.configuration.sessionDomain = sessionDomain;
    return await runNewSession(eventList, this.configuration);
  }

  private generateRunAssertion(
    original_reference: string,
    new_reference: string,
    test_failed: boolean,
    last_event: BLSessionEvent,
    execution_error: boolean,
    backend_type : NTRunnerConfig['backendType'],
    session_logged: boolean,
    http_test_pass: boolean
  ) {
    return {
      original_reference,
      new_reference,
      info: {
        last_event,
        execution_error,
        backend_type,
        test_failed,
        session_logged,
        http_test_pass,
      }
    } as NTAssertion;
  }

  private async clearFilesSaved() {
    await fs.rmSync(process.cwd() + '/video', { recursive: true, force: true });
  }
}
