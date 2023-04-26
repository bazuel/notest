import {
  afterResponseFilter,
  BLSessionEvent,
  eventReference,
  JsonCompressor,
  NTClusterMessage,
  NTHttpAssertion,
  NTMissedEventsAssertion,
  NTRunFinishedAssertion,
  NTSession,
  NTVisualAssertion
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
      const newReference = eventReference(monitoringSession.events[0], Date.now());
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
      //http status assertion
      const httpStatusAssertion: NTHttpAssertion = { payload: {} } as any;
      httpStatusAssertion.original_reference = encodeURIComponent(reference);
      httpStatusAssertion.new_reference = newReference;
      httpStatusAssertion.type = 'http';
      httpStatusAssertion.name = 'status';
      const status = assertionService.compareSimilarList(
        compareStatusResponse,
        eventList,
        monitoringSession.events,
        afterResponseFilter
      );
      httpStatusAssertion.payload.errorEvents = status.eventsError.map((e) => {
        const a = new JsonCompressor();
        return a.compressToBase64(e);
      }) as any;

      //http body request assertion
      const httpBodyAssertion: NTHttpAssertion = { payload: {} } as any;
      httpBodyAssertion.original_reference = encodeURIComponent(reference);
      httpBodyAssertion.new_reference = newReference;
      httpBodyAssertion.type = 'http';
      httpBodyAssertion.name = 'bodyRequest';
      const body = assertionService.compareSimilarList(
        compareBodyKeys,
        eventList,
        monitoringSession.events,
        afterResponseFilter
      );
      httpBodyAssertion.payload.errorEvents = body.eventsError.map((e) => {
        const a = new JsonCompressor();
        return a.compressToBase64(e);
      }) as any;

      //Http content Type assertion
      const httpContentTypeAssertion: NTHttpAssertion = { payload: {} } as any;
      httpContentTypeAssertion.original_reference = encodeURIComponent(reference);
      httpContentTypeAssertion.new_reference = newReference;
      httpContentTypeAssertion.type = 'http';
      httpContentTypeAssertion.name = 'contentType';
      const type = assertionService.compareSimilarList(
        compareBodyType,
        eventList,
        monitoringSession.events,
        afterResponseFilter
      );
      httpContentTypeAssertion.payload.errorEvents = type.eventsError.map((e) => {
        const a = new JsonCompressor();
        return a.compressToBase64(e);
      }) as any;

      //Visual assertion
      const visualAssertion: NTVisualAssertion = { payload: {} } as any;
      visualAssertion.original_reference = encodeURIComponent(reference);
      visualAssertion.new_reference = newReference;
      visualAssertion.type = 'visual';
      const { imagesSimilarity } = await assertionService.compareImages(
        targetList,
        reference,
        newReference
      );

      visualAssertion.payload.mismatchedPixel = imagesSimilarity;

      //Missed events assertion
      const missedEventAssertion: NTMissedEventsAssertion = { payload: {} } as any;
      missedEventAssertion.original_reference = encodeURIComponent(reference);
      missedEventAssertion.new_reference = newReference;
      missedEventAssertion.type = 'missedEvents';
      missedEventAssertion.payload.missedEvents = status.notFoundedEvents.map((e) => {
        const a = new JsonCompressor();
        return a.compressToBase64(e);
      }) as any;
      //Run finished assertion
      const runFinishedAssertion: NTRunFinishedAssertion = { payload: {} } as any;
      runFinishedAssertion.original_reference = encodeURIComponent(reference);
      runFinishedAssertion.new_reference = newReference;
      runFinishedAssertion.type = 'runSuccessfullyFinished';
      runFinishedAssertion.payload.testSuccessfullyFinished = !monitoringSession.testFailed;

      await assertionService.save(httpStatusAssertion);
      await assertionService.save(httpBodyAssertion);
      await assertionService.save(httpContentTypeAssertion);
      await assertionService.save(visualAssertion);
      await assertionService.save(missedEventAssertion);
      await assertionService.save(runFinishedAssertion);

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
