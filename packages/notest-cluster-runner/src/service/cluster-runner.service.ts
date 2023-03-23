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

      const { reference, backendType } = JSON.parse(
        messagePayload.message.value.toString()
      ) as NTClusterMessage;

      let eventList = await sessionService.read(reference);
      //login session
      const loginEventList = await sessionService.getLoginReference(reference);
      if (loginEventList) {
        console.log('Login phase started');
        const loginResult = await this.runSessionWithConfiguration(loginEventList, {
          login: true,
          backendType: 'full'
        });
        this.configuration.loginEvent = loginResult.events;
        console.log('Login phase ended');
      }
      //Execute Event List
      if (!eventList.length) return;
      const { events, testFailed, lastEvent, videoPath } = await this.runSessionWithConfiguration(
        eventList,
        {
          monitoring: true,
          recordVideo: true,
          backendType
        }
      );
      const { screenshotList, startVideoTimeStamp } = await this.runSessionWithConfiguration(
        eventList,
        {
          takeScreenshot: true,
          backendType
        }
      );
      //Save Results and Clean
      const newReference = eventReference(events[0]);
      const newSession: NTSession = {
        reference: newReference
      } as NTSession;
      const newEventsZipped = (await new JsonCompressor().zip(events)) as Buffer;
      await sessionService.save(newEventsZipped, newSession);
      const assertion = this.generateRunAssertion(
        encodeURIComponent(reference),
        eventReference(events[0]),
        testFailed,
        lastEvent,
        false
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
      backendType
    }: NTRunnerConfig
  ) {
    this.configuration.monitoring = monitoring;
    this.configuration.recordVideo = recordVideo;
    this.configuration.login = login;
    this.configuration.takeScreenshot = takeScreenshot;
    this.configuration.backendType = backendType;
    return await runNewSession(eventList, this.configuration);
  }

  private generateRunAssertion(
    original_reference: string,
    new_reference: string,
    test_failed: boolean,
    last_event: BLSessionEvent,
    execution_error: boolean
  ) {
    return {
      original_reference,
      new_reference,
      test_failed,
      info: {
        last_event,
        execution_error
      }
    } as NTAssertion;
  }

  private async clearFilesSaved() {
    await fs.rmSync(process.cwd() + '/video', { recursive: true, force: true });
  }
}
