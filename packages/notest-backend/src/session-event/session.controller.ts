import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import {
  AssertionService,
  globalConfig,
  MediaService,
  SessionService
} from '@notest/backend-shared';
import {
  BLEvent,
  BLSessionEvent,
  NTAssertion,
  NTClusterMessage,
  NTScreenshot,
  NTSession,
  streamToBuffer,
  unzipJson
} from '@notest/common';
import { UserId, UserIdIfHasToken } from '../shared/decorators/token.decorator';
import { ProducerService } from '../notest-shared/services/producer.service';
import { HasToken } from '../shared/guards/token.guards';

export type MultipartFile = {
  file: ReadableStream;
  fileField: string;
  filename: string;
  mimetype: string;
  fields: {
    [key: string]: {
      encoding: string;
      fieldname: string;
      fieldnameTruncated: false;
      mimetype: string;
      value: string;
      valueTruncated: boolean;
    };
  };
};

@Controller('session')
export class SessionController {
  fullDoms: { [id: string]: BLSessionEvent } = {};

  constructor(
    private sessionService: SessionService,
    private producerService: ProducerService,
    private assertionService: AssertionService,
    private mediaService: MediaService
  ) {}

  @Post('shot')
  async takeScreenshot(@Req() req, @Res({ passthrough: true }) res) {
    const data: MultipartFile = await req.file();
    const zippedBody = await streamToBuffer(data.file);
    const body: { reference: string; fullDom: BLSessionEvent } = await unzipJson(zippedBody);
    const { reference, fullDom } = body;
    console.log('takeScreenshot', fullDom);
    console.log(reference);
    this.fullDoms[reference] = fullDom;
    const frontendBase = globalConfig.app_url || 'http://localhost:4200';
    const frontendUrl = `${frontendBase}/session/session-camera?id=${reference}&backend=${globalConfig.backend_url}`;
    console.log('frontendUrl', frontendUrl);
    const shotUrl =
      process.env.SCREENSHOT_URL +
      `/?width=${fullDom.width}&height=${fullDom.height}&wait=10000&url=${encodeURIComponent(
        frontendUrl
      )}`;
    console.log(shotUrl);
    const imageResponse = await fetch(shotUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const screenshot: NTScreenshot[] = [
      {
        name: 'shot',
        data: new Buffer(imageBuffer),
        fired: new Date(),
        type: 'image'
      }
    ];
    await this.mediaService.saveScreenshot(screenshot, reference);
    return { ok: true };
  }

  @Get('shot')
  async takeScreenshotData(@Query('id') id: string) {
    const fullDom = this.fullDoms[encodeURIComponent(id)];
    delete this.fullDoms[encodeURIComponent(id)];
    return fullDom;
  }

  @Post('upload')
  async upload(@Req() req, @Res() res, @UserIdIfHasToken() userid): Promise<any> {
    if (!req.isMultipart()) throw new Error('Not a multipart request');
    const data: MultipartFile = await req.file();
    const zipBuffer = await streamToBuffer(data.file);
    const events: BLSessionEvent[] = await unzipJson(zipBuffer);
    const { reference, rerun, ...sessionInfo } = JSON.parse(data.fields['session_info'].value);
    console.log('upload', reference, rerun, sessionInfo);
    const url = events[0].url;
    //TODO event.service.save not working
    //await this.eventService.save(events, reference);
    const session: NTSession = {
      url,
      reference,
      userid: userid || sessionInfo.userid,
      info: sessionInfo
    } as NTSession;
    await this.sessionService.save(zipBuffer, session);

    if (rerun) {
      console.log('Sent message to kafka');
      await this.producerService.produceMessage({
        reference: decodeURIComponent(reference),
        backendType: 'full'
      });
    }
    res.send({ ok: true, reference });
  }

  @Post('update-session-info')
  async setLoginReference(@Body() session: NTSession) {
    await this.sessionService.update(session);
  }

  @Get('download')
  async download(@Query('reference') reference: string) {
    const eventList: BLEvent[] = await this.sessionService.read(reference);
    return eventList;
  }

  @Get('run')
  async run(
    @Query('reference') reference: string,
    @Query('backend_type') backendType: 'mock' | 'full',
    @Query('session_domain') sessionDomain: string
  ) {
    const message: NTClusterMessage = {
      reference: decodeURIComponent(reference),
      backendType,
      sessionDomain
    };
    await this.producerService.produceMessage(message);
  }

  @Get('find-by-url')
  async findByUrl(@Query() query) {
    const { url, ...filters } = query;
    if (!url) throw new Error('No url provided');
    const references = await this.sessionService
      .findByUrl(url)
      .then((result) => result.map((row) => decodeURIComponent(row.reference)));
    return await Promise.all(
      references.map((ref) => {
        return {
          reference: ref,
          session: this.downloadFiltered({ reference: ref, ...filters })
        };
      })
    );
  }

  @Get('download-filtered')
  async downloadFiltered(@Query() query) {
    const { reference, ...filters } = query;
    let eventList: BLEvent[] = await this.sessionService.read(reference);
    eventList = eventList.filter((event) => {
      for (const key in filters) {
        if (event[key] != filters[key]) return false;
      }
      return true;
    });
    return eventList;
  }

  @HasToken()
  @Get('find-by-userid')
  async findById(@UserId() userid: string) {
    const sessions = await this.sessionService.findByField('userid', userid);
    return { sessions };
  }

  @Get('find-by-reference')
  async findByReference(@Query('reference') reference: string) {
    const sessions = await this.sessionService.findByField(
      'reference',
      encodeURIComponent(reference)
    );
    return sessions[0];
  }

  @Get('get-run-history')
  async runHistory(@Query('reference') reference: string) {
    const assertions = await this.assertionService.findByField(
      'original_reference',
      encodeURIComponent(reference)
    );
    return this.getRunHistory(assertions);
  }

  @Get('get-battery-run-history')
  async batteryRunHistory(
    @Query('battery_id') batteryId: string,
    @Query('battery_timestamp') batteryTimestamp?: string
  ) {
    type batteryType = Record<string, NTAssertion[]>;
    let timestamp;
    if (batteryTimestamp != 'undefined') {
      timestamp = batteryTimestamp;
    } else {
      timestamp = await this.assertionService.findLastTimestampByBatteryId(batteryId);
    }
    const assertions: NTAssertion[] = await this.assertionService.findByFields({
      battery_id: batteryId,
      run_timestamp: timestamp
    });
    let battery: batteryType = assertions.reduce((acc: batteryType, assertion) => {
      if (!acc[assertion.original_reference]) acc[assertion.original_reference] = [];
      acc[assertion.original_reference].push(assertion);
      return acc;
    }, {});
    return battery;
  }

  @Get('get-battery-run-timestamps')
  async batteryRunTimestamps(@Query('battery_id') batteryId: string) {
    return await this.assertionService.findAllBatteryTimestamps(batteryId);
  }

  @Get('login-sessions')
  async loginSessions(@Query('domain') domain: string, @UserId() userid: string) {
    const sessions = await this.sessionService.findByDomain(domain, userid);
    return sessions.filter((s) => s.info.isLogin);
  }

  @Get('get-rerun-session')
  async getRerunSession(@Query('reference') reference: string) {
    return await this.assertionService.countRerun(encodeURIComponent(reference));
  }

  private async getRunHistory(assertions: NTAssertion[]) {
    const rerunSessionsMap = assertions.reduce(
      (acc: { [k: string]: NTAssertion[] }, current_assertion) => {
        if (!acc[current_assertion.new_reference]) acc[current_assertion.new_reference] = [];
        acc[current_assertion.new_reference].push(current_assertion);
        return acc;
      },
      {}
    );
    const runHistory = await Promise.all(
      Object.entries(rerunSessionsMap).map(async ([new_reference, assertions]) => {
        const session = await this.sessionService.findByField('reference', new_reference);
        const media = await this.mediaService.findByField('reference', new_reference);
        return {
          session: session[0],
          screenshot: media.filter((m) => m.type === 'image').reverse(),
          video: media.filter((m) => m.type === 'video')[0],
          assertions
        };
      })
    );
    return runHistory.reverse();
  }
}
