import { StorageService } from '../shared/services/storage.service';
import { NTMedia, pathScreenshotFromReference, pathVideoRecordFromReference } from '@notest/common';
import fs from 'fs';
import { ConfigService } from '../shared/services/config.service';
import { PostgresDbService, sql } from '../shared/services/postgres-db.service';
import { CrudService } from '../shared/services/crud.service';

export class MediaService extends CrudService<NTMedia> {
  protected table = 'nt_media';
  protected id = 'media_id';

  constructor(private storageService: StorageService, db: PostgresDbService) {
    super(db);
    this.generateTable();
  }

  async generateTable() {
    const tableExists = await this.db.tableExists(this.table);
    if (!tableExists) {
      await this.db.query`
          create table if not exists ${sql(this.table)}
          (
              ${sql(this.id)} BIGSERIAL PRIMARY KEY,
              reference       text,
              name            text,
              type            text,
              start           TIMESTAMPTZ,
              created         TIMESTAMPTZ
          );
      `;
      await this.db.query`CREATE INDEX ON ${sql(this.table)} (reference);`;
    }
  }

  async saveScreenshot(screenshotList: { name: string; data: Buffer; fired: Date }[], reference) {
    console.log('Uploading screenshots ...');
    for (const screenshot of screenshotList) {
      const path = pathScreenshotFromReference(reference, screenshot.name);
      const imageMetaData: NTMedia = {
        name: screenshot.name,
        reference: reference,
        type: 'image',
        start: screenshot.fired
      } as NTMedia;
      await this.create(imageMetaData);
      await this.storageService.upload(screenshot.data, path);
    }
    console.log('Uploaded Screenshots');
  }

  async getScreenshot(reference, name) {
    const path = pathScreenshotFromReference(encodeURIComponent(reference), name);
    console.log('screenshot path: ', path);
    try {
      return this.storageService.read(path);
    } catch (e) {
      console.log('screenshot error: ', path);
      return null;
    }
  }

  async saveVideo(reference: string, startVideoTimeStamp: Date, videoPath: string) {
    console.log('Uploading Video ...');
    const videoName = 'video';
    const videoStream = fs.createReadStream(videoPath);
    const storageVideoPath = pathVideoRecordFromReference(reference, videoName);
    const videoMetaData: NTMedia = {
      name: videoName,
      reference: reference,
      type: 'video',
      start: startVideoTimeStamp
    } as NTMedia;
    await this.create(videoMetaData);
    await this.storageService.upload(videoStream, storageVideoPath);
    console.log('Uploaded Video');
  }

  async getVideo(reference, name) {
    const path = pathVideoRecordFromReference(encodeURIComponent(reference), name);
    console.log('recorded path: ', path);
    try {
      return await this.storageService.getStream(path);
    } catch (e) {
      console.log('video error: ', path);
      return null;
    }
  }
}

export const mediaService = new MediaService(
  new StorageService(new ConfigService()),
  new PostgresDbService()
);
