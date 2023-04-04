import {
  BLSessionEvent,
  eventReference,
  JsonCompressor,
  NTAssertion,
  NTClusterMessage,
  NTSession
} from '@notest/common';
import * as fs from 'fs';
import { runLoginSession, runSession } from '../functions/run-new-session';
import { assertionService, mediaService, sessionService } from 'notest-backend-shared';
import { EachMessagePayload } from 'kafkajs';
import { StatusResponseAssertion } from 'notest-backend-shared/src/session-comparator/http-assertion/status-response.assertion';
import { CompareBodyTypeAssertion } from 'notest-backend-shared/src/session-comparator/http-assertion/compare-body-type.assertion';
import { CompareJsonBodyRequestKeysAssertion } from 'notest-backend-shared/src/session-comparator/http-assertion/compare-json-body-request-keys.assertion';

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
      const fetch_response = assertionService.compareHttpRequest(
        eventList,
        monitoringSession.events,
        new StatusResponseAssertion()
      );
      const fetch_body_type = assertionService.compareHttpRequest(
        eventList,
        monitoringSession.events,
        new CompareBodyTypeAssertion()
      );
      const response_body_match = assertionService.compareHttpRequest(
        eventList,
        monitoringSession.events,
        new CompareJsonBodyRequestKeysAssertion()
      );
      const fetch_response_pass =
        fetch_response.notFoundedEvents.length == 0 && fetch_response.eventsError.length == 0;
      const fetch_body_type_pass =
        fetch_body_type.notFoundedEvents.length == 0 && fetch_body_type.eventsError.length == 0;
      const response_body_match_pass =
        response_body_match.notFoundedEvents.length == 0 &&
        response_body_match.eventsError.length == 0;
      const assertion: NTAssertion = {
        original_reference: encodeURIComponent(reference),
        new_reference: newReference,
        info: {
          last_event: monitoringSession.lastEvent,
          test_execution_failed: monitoringSession.testFailed
        },
        assertions: {
          fetch_response_pass,
          fetch_body_type_pass,
          response_body_match_pass
        },
        assertions_details: {
          fetch_response_match_not_found: fetch_response.notFoundedEvents,
          fetch_response_compare_error: fetch_response.eventsError,
          fetch_body_type_match_not_found: fetch_body_type.notFoundedEvents,
          fetch_body_type_compare_error: fetch_body_type.eventsError,
          request_body_match_not_found: response_body_match.notFoundedEvents,
          request_body_compare_error: response_body_match.eventsError
        }
      };
      await assertionService.save(assertion);
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
