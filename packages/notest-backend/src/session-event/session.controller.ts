import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AssertionService, MediaService, SessionService } from '@notest/backend-shared';
import { BLEvent, BLSessionEvent, NTSession, streamToBuffer, unzipJson } from '@notest/common';
import { EventService } from './event.service';
import { UserId, UserIdIfHasToken } from '../shared/token.decorator';
import { ProducerService } from '../notest-shared/services/producer.service';

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
    private eventService: EventService,
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
    this.fullDoms[reference] = fullDom;
    const frontendBase = process.env.APP_URL || 'http://localhost:4200';
    const frontendUrl =
      frontendBase + `/session/session-camera?id=${encodeURIComponent(reference)}`;
    const shotUrl =
      process.env.SCREENSHOT_URL +
      `/?width=${fullDom.width}&height=${fullDom.height}&wait=10000&url=${frontendUrl}`;
    console.log(shotUrl);
    const imageResponse = await fetch(shotUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const screenshot = [
      {
        name: 'shot',
        data: new Buffer(imageBuffer),
        fired: new Date()
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
    const { reference, ...sessionInfo } = JSON.parse(data.fields['session_info'].value);
    const url = events[0].url;
    //TO-DO event.service.save not working
    //await this.eventService.save(events, reference);
    const session: NTSession = {
      url,
      reference,
      userid,
      info: sessionInfo
    } as NTSession;
    await this.sessionService.save(zipBuffer, session);
    console.log("Send message to kafka");
    await this.producerService.produceMessage(decodeURIComponent(reference));
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
  async run(@Query('reference') reference: string) {
    await this.producerService.produceMessage(decodeURIComponent(reference));
  }

  @Get('find-by-url')
  async findByUrl(@Query() query) {
    const { url, ...filters } = query;
    if (!url) throw new Error('No url provided');
    const references = await this.sessionService
      .findByUrl(url)
      .then((result) => result.map((row) => decodeURIComponent(row.reference)));
    const sessions = await Promise.all(
      references.map((ref) => {
        return {
          reference: ref,
          session: this.downloadFiltered({ reference: ref, ...filters })
        };
      })
    );
    return sessions;
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

  //@UseGuards(HasToken)
  @Get('find-by-userid')
  async findById(@UserId() userid: string) {
    const sessions = await this.sessionService.findByField('userid', userid);
    return { sessions };
  }

  //@UseGuards(HasToken)
  @Get('find-by-reference')
  async findByReference(@Query('reference') reference: string) {
    const sessions = await this.sessionService.findByField(
      'reference',
      encodeURIComponent(reference)
    );
    return sessions[0];
  }

  @Get('run-history')
  async runHistory(@Query('reference') reference: string) {
    const assertions = await this.assertionService.findByField('original_reference', reference);
    const runHistory = await Promise.all(
      assertions.map(async (assertion) => {
        const session = await this.sessionService.findByField('reference', assertion.new_reference);
        const media = await this.mediaService.findByField('reference', assertion.new_reference);
        return {
          session: session[0],
          screenshot: media.filter((m) => m.type === 'image').reverse(),
          video: media.filter((m) => m.type === 'video')[0],
          assertion
        };
      })
    );
    return runHistory.reverse();
  }

  @Get('login-sessions')
  async loginSessions(@Query('domain') domain: string, @UserId() userid: string) {
    const sessions = await this.sessionService.findByDomain(domain, userid);
    return sessions.filter((s) => s.info.isLogin);
  }
}
