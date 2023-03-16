import { Controller, Get, Post, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { AssertionService, MediaService } from '@notest/backend-shared';
import { Readable } from 'stream';
import { MultipartFile } from '../../session-event/session.controller';
import { streamToBuffer } from '@notest/common';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService, private assertionService: AssertionService) {}

  @Get('screenshot-download')
  async getScreenshot(
    @Res({ passthrough: true }) res,
    @Query('reference') reference: string,
    @Query('name') name: string
  ) {
    const buffer = await this.mediaService.getScreenshot(decodeURIComponent(reference), name);
    res.header('Content-Type', 'image/png');
    const stream = Readable.from(buffer);
    return new StreamableFile(stream);
  }

  @Post('screenshot-upload')
  async uploadScreenshot(@Req() req, @Res() res) {
    const data: MultipartFile = await req.file();
    const name: string = data.fields['name'].value;
    const reference: string = data.fields['reference'].value;
    const timestamp: number = +data.fields['timestamp'].value;
    const buffer = await streamToBuffer(data.file);
    await this.mediaService.saveScreenshot(
      [{ name, data: buffer, fired: new Date(timestamp) }],
      reference
    );
  }

  @Get('video-download')
  async getVideo(
    @Res({ passthrough: true }) res,
    @Query('reference') reference: string,
    @Query('name') name: string
  ) {
    const stream = await this.mediaService.getVideo(decodeURIComponent(reference), name);
    res.header('Content-Disposition', `attachment; filename="${name}.webm"`);
    res.header('Access-Control-Expose-Headers', `Content-Disposition`);
    return new StreamableFile(stream);
  }
}
