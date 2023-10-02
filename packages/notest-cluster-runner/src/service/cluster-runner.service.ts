import {
  afterResponseFilter,
  BLSessionEvent,
  eventReference,
  JsonCompressor,
  NTClusterMessage,
  NTHttpAssertion,
  NTMissedEventsAssertion,
  NTRunFinishedAssertion,
  NTSession
} from '@notest/common';
import * as fs from 'fs';
import {
  VideoReturnType,
  runLoginSession,
  runSession,
  ScreenshotReturnType
} from '../functions/session-initiator';
import { assertionService, mediaService, sessionService } from 'notest-backend-shared';
import { EachMessagePayload } from 'kafkajs';
import { compareStatusResponse } from 'notest-backend-shared/src/session-comparator/http-assertion/status-response.assertion';
import { compareBodyType } from 'notest-backend-shared/src/session-comparator/http-assertion/compare-body-type.assertion';
import { compareBodyKeys } from 'notest-backend-shared/src/session-comparator/http-assertion/compare-json-body-request-keys.assertion';

export class ClusterRunnerService {
  private sessionEvents: BLSessionEvent[] = [];
  private loggedSession: boolean;
  private backendType: 'mock' | 'full';
  private loggedStoragesAndCookie: BLSessionEvent[] = [];
  private assertionRectList: DOMRect[];

  private reference: string;
  private newReference: string;

  private newSession: Partial<NTSession>;
  private screenshotSession: ScreenshotReturnType;
  private videoSession: VideoReturnType;
  private batteryId: string;
  private timestamp: number;

  async runMessage(messagePayload: EachMessagePayload) {
    if (messagePayload.message.size == 0) throw new Error('Empty message');
    const timer = setInterval(() => messagePayload.heartbeat(), 5000);
    const { reference, backendType, sessionDomain, batteryId, runTimestamp } = JSON.parse(
      messagePayload.message.value.toString()
    ) as NTClusterMessage;
    this.reference = reference;
    this.batteryId = batteryId;
    this.timestamp = runTimestamp;
    this.backendType = backendType;

    try {
      console.log('Session Started');
      await this.prepareRun(reference, sessionDomain);

      await runSession(
        this.sessionEvents,
        sessionDomain,
        backendType,
        this.loggedStoragesAndCookie
      ).then((results) => {
        this.screenshotSession = results.screenshotSession;
        this.videoSession = results.monitoringSession;
      });

      this.createNewSession();
      await this.saveAll();
      await this.getAssertions();

      console.log('Session Ended');
    } catch (e) {
      await this.handleFailedSession(e);
    } finally {
      this.removeVideo(this.videoSession.videoPath);
      clearInterval(timer);
    }
  }

  private createNewSession() {
    this.newReference = this.screenshotSession.reference;
    this.newSession = {
      reference: this.newReference,
      info: {
        title: '',
        description: '',
        backend_type: this.backendType,
        internal_error: false,
        session_logged: this.loggedSession,
        e2eScript: ''
      }
    };
  }

  private async saveAll() {
    // mediaService
    //   .saveScreenshotList(this.screenshotSession.screenshotList, this.newReference)
    //   .catch((e) => {
    //     console.log('Failed to upload Screenshot', e);
    //     this.newSession.info.internal_error = true;
    //   });
    mediaService
      .saveVideo(
        this.newReference,
        this.screenshotSession.startVideoTimeStamp,
        this.videoSession.videoPath
      )
      .catch((e) => {
        console.log('Failed to upload Video', e);
        this.newSession.info.internal_error = true;
      });
    const newEventsZipped = await new JsonCompressor().zip(this.screenshotSession.events);
    sessionService.save(newEventsZipped, this.newSession);
  }

  private async prepareRun(reference: string, sessionDomain: string) {
    this.assertionRectList = await sessionService.getTargetListFromReference(reference);
    this.sessionEvents = await sessionService.read(reference);
    if (!this.sessionEvents.length) throw new Error('No events found');

    const loginEventList = await sessionService.getLoginSessionIfExists(reference);
    this.loggedSession = !!loginEventList;
    if (loginEventList) {
      this.loggedStoragesAndCookie = await runLoginSession(loginEventList, sessionDomain);
    }
  }

  private removeVideo(videoPath: string) {
    if (fs.existsSync(videoPath)) fs.rmSync(videoPath, { recursive: true, force: true });
  }

  private async getAssertions() {
    //http status assertion
    const httpStatusAssertion: NTHttpAssertion = { payload: {} } as any;
    httpStatusAssertion.original_reference = encodeURIComponent(this.reference);
    httpStatusAssertion.new_reference = this.newReference;
    httpStatusAssertion.type = 'http';
    httpStatusAssertion.name = 'status';
    const status = assertionService.compareSimilarList(
      compareStatusResponse,
      this.sessionEvents,
      this.screenshotSession.events,
      afterResponseFilter
    );
    httpStatusAssertion.payload.errorEvents = status.eventsError.map((e) => {
      const a = new JsonCompressor();
      return a.compressToBase64(e);
    }) as any;

    //http body request assertion
    const httpBodyAssertion: NTHttpAssertion = { payload: {} } as any;
    httpBodyAssertion.original_reference = encodeURIComponent(this.reference);
    httpBodyAssertion.new_reference = this.newReference;
    httpBodyAssertion.type = 'http';
    httpBodyAssertion.name = 'bodyRequest';
    const body = assertionService.compareSimilarList(
      compareBodyKeys,
      this.sessionEvents,
      this.screenshotSession.events,
      afterResponseFilter
    );
    httpBodyAssertion.payload.errorEvents = body.eventsError.map((e) => {
      const a = new JsonCompressor();
      return a.compressToBase64(e);
    }) as any;

    //Http content Type assertion
    const httpContentTypeAssertion: NTHttpAssertion = { payload: {} } as any;
    httpContentTypeAssertion.original_reference = encodeURIComponent(this.reference);
    httpContentTypeAssertion.new_reference = this.newReference;
    httpContentTypeAssertion.type = 'http';
    httpContentTypeAssertion.name = 'contentType';
    const type = assertionService.compareSimilarList(
      compareBodyType,
      this.sessionEvents,
      this.screenshotSession.events,
      afterResponseFilter
    );
    httpContentTypeAssertion.payload.errorEvents = type.eventsError.map((e) => {
      const a = new JsonCompressor();
      return a.compressToBase64(e);
    }) as any;

    //Visual assertion
    // const visualAssertion: NTVisualAssertion = { payload: {} } as any;
    // visualAssertion.original_reference = encodeURIComponent(this.reference);
    // visualAssertion.new_reference = this.newReference;
    // visualAssertion.type = 'visual';
    // const { imagesSimilarity } = await assertionService.compareImages(
    //   this.assertionRectList,
    //   reference,
    //   this.newReference
    // );
    //
    // visualAssertion.payload.mismatchedPixel = imagesSimilarity;

    //Missed events assertion
    const missedEventAssertion: NTMissedEventsAssertion = { payload: {} } as any;
    missedEventAssertion.original_reference = encodeURIComponent(this.reference);
    missedEventAssertion.new_reference = this.newReference;
    missedEventAssertion.type = 'missedEvents';
    missedEventAssertion.payload.missedEvents = status.notFoundedEvents.map((e) => {
      const a = new JsonCompressor();
      return a.compressToBase64(e);
    }) as any;
    //Run finished assertion
    const runFinishedAssertion: NTRunFinishedAssertion = { payload: {} } as any;
    runFinishedAssertion.original_reference = encodeURIComponent(this.reference);
    runFinishedAssertion.new_reference = this.newReference;
    runFinishedAssertion.type = 'runSuccessfullyFinished';
    runFinishedAssertion.payload.testSuccessfullyFinished = !this.videoSession.testFailed;
    if (this.batteryId) {
      httpStatusAssertion.battery_id = this.batteryId;
      httpStatusAssertion.run_timestamp = this.timestamp;
      httpBodyAssertion.battery_id = this.batteryId;
      httpBodyAssertion.run_timestamp = this.timestamp;
      httpContentTypeAssertion.battery_id = this.batteryId;
      httpContentTypeAssertion.run_timestamp = this.timestamp;
      // visualAssertion.battery_id = this.batteryId;
      // visualAssertion.run_timestamp = this.timestamp;
      missedEventAssertion.battery_id = this.batteryId;
      missedEventAssertion.run_timestamp = this.timestamp;
      runFinishedAssertion.battery_id = this.batteryId;
      runFinishedAssertion.run_timestamp = this.timestamp;
    }
    await assertionService.save(httpStatusAssertion);
    await assertionService.save(httpBodyAssertion);
    await assertionService.save(httpContentTypeAssertion);
    // await assertionService.save(visualAssertion);
    await assertionService.save(missedEventAssertion);
    await assertionService.save(runFinishedAssertion);
  }

  private async handleFailedSession(e) {
    console.log(`Error: \nsession reference: ${this.reference}`, e);
    const runFinishedAssertion: NTRunFinishedAssertion = {
      original_reference: encodeURIComponent(this.reference),
      new_reference: '',
      type: 'runSuccessfullyFinished',
      payload: { testSuccessfullyFinished: false, error: e }
    };
    await assertionService.save(runFinishedAssertion);
  }
}
