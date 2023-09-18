import { Controller, Get, Post, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { MediaService } from '@notest/backend-shared';
import { Readable } from 'stream';
import { MultipartFile } from '../../session-event/session.controller';
import { streamToBuffer } from '@notest/common';

@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get('screenshot-download')
  async getScreenshot(
    @Res({ passthrough: true }) res,
    @Query('reference') reference: string,
    @Query('name') name: string,
    @Query('base64') base64?: string
  ) {
    const buffer = await this.mediaService.getScreenshot(decodeURIComponent(reference), name);

    if (base64 == 'true') {
      const bs64 = buffer.toString('base64');
      return { data: `data:image/png;base64,${bs64}` };
    } else {
      res.header('Content-Type', 'image/png');
      const stream = Readable.from(buffer);
      return new StreamableFile(stream);
    }
  }

  @Post('screenshot-upload')
  async uploadScreenshot(@Req() req, @Res() res) {
    const data: MultipartFile = await req.file();
    const name: string = data.fields['name'].value;
    const reference: string = data.fields['reference'].value;
    const timestamp: number = +data.fields['timestamp'].value;
    const buffer = await streamToBuffer(data.file);
    await this.mediaService.saveScreenshot(
      [{ name, data: buffer, fired: new Date(timestamp), type: 'image' }],
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

  @Get('asset-download')
  async getAsset(@Query('url') url?: string) {
    const res = await fetch(url);
    const bs64 = await streamToBase64(res.body);
    return { data: bs64 };
  }
}

async function streamToBase64(readableStream) {
  let chunks = [];
  for await (let chunk of readableStream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('base64');
}
