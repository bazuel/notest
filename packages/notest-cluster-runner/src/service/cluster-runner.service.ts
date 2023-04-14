import {
  afterResponseFilter,
  BLHTTPResponseEvent,
  BLSessionEvent,
  eventReference,
  JsonCompressor,
  NTAssertion,
  NTClusterMessage,
  NTComparatorStrategy,
  NTSession
} from '@notest/common';
import * as fs from 'fs';
import { runLoginSession, runSession } from '../functions/run-new-session';
import { assertionService, mediaService, sessionService } from 'notest-backend-shared';
import { EachMessagePayload } from 'kafkajs';
import { compareStatusResponse } from 'notest-backend-shared/src/session-comparator/http-assertion/status-response.assertion';
import { compareBodyType } from 'notest-backend-shared/src/session-comparator/http-assertion/compare-body-type.assertion';
import { compareBodyKeys } from 'notest-backend-shared/src/session-comparator/http-assertion/compare-json-body-request-keys.assertion';

export class ClusterRunnerService {
  async runMessage(messagePayload: EachMessagePayload) {
    if (messagePayload.message.size == 0) throw new Error('Empty message');
    const timer = setInterval(() => messagePayload.heartbeat(), 5000);
    try {
      //get Event List from reference
      console.log('Session Started');

      const { reference, backendType, sessionDomain } = JSON.parse(
        messagePayload.message.value.toString()
      ) as NTClusterMessage;

      const targetList = await sessionService.getTargetListFromReference(reference);

      let eventList = await sessionService.read(reference);
      if (!eventList.length) throw new Error('No events found');

      //login session
      const loginEventList = await sessionService.getLoginReference(reference);
      let loggedStoragesAndCookie: BLSessionEvent[] = [];
      if (loginEventList) {
        loggedStoragesAndCookie = await runLoginSession(loginEventList, sessionDomain);
      }
      //Execute Event List
      const [monitoringSession, screenshotSession] = await runSession(
        eventList,
        sessionDomain,
        backendType,
        loggedStoragesAndCookie
      );
      //Save Results and Clean
      const newReference = eventReference(monitoringSession.events[0]);
      const newSession: Partial<NTSession> = {
        reference: newReference,
        info: {
          title: '',
          description: '',
          backend_type: backendType,
          internal_error: false,
          session_logged: !!loginEventList
        }
      };
      await mediaService
        .saveScreenshot(screenshotSession.screenshotList, newReference)
        .catch((e) => {
          console.log('Failed to upload Screenshot', e);
          newSession.info.internal_error = true;
        });
      await mediaService
        .saveVideo(newReference, screenshotSession.startVideoTimeStamp, monitoringSession.videoPath)
        .catch((e) => {
          console.log('Failed to upload Video', e);
          newSession.info.internal_error = true;
        });
      const newEventsZipped = await new JsonCompressor().zip(monitoringSession.events);
      await sessionService.save(newEventsZipped, newSession);

      //**************************************************************************************************************//

      const assertion: NTAssertion = {} as any;
      const { mismatchedPixel } = await assertionService.compareImages(
        targetList,
        reference,
        newReference
      );

      assertion.assertions.visual = { ...assertion.assertions.visual, mismatchedPixel };

      const status = assertionService.compareSimilarList(
        compareStatusResponse,
        eventList,
        monitoringSession.events,
        afterResponseFilter,
        'status'
      );
      const body = assertionService.compareSimilarList(
        compareBodyKeys,
        eventList,
        monitoringSession.events,
        afterResponseFilter,
        'bodyRequest'
      );
      const type = assertionService.compareSimilarList(
        compareBodyType,
        eventList,
        monitoringSession.events,
        afterResponseFilter,
        'contentType'
      );

      if (status.notFoundedEvents.length > 0)
        assertion.assertions.http.notFounded = status.notFoundedEvents;
      if (type.eventsError.length > 0 || status.eventsError.length > 0 || body.eventsError)
        assertion.assertions.http.comparisons = [
          ...type.eventsError,
          ...status.eventsError,
          ...body.eventsError
        ];

      await assertionService.save(assertion);
      //**************************************************************************************************************//
      console.log('Session Ended');
    } catch (e) {
      console.log(`Error: \nsession reference: ${messagePayload.message.value.toString()}`, e);
    } finally {
      await this.removeVideo();
      clearInterval(timer);
    }
  }

  private async removeVideo() {
    await fs.rmSync(process.cwd() + '/video', { recursive: true, force: true });
  }
}
