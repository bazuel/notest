import { ReadStream } from 'fs';
import { Readable } from 'stream';

export class StorageService {
  list() {}

  delete(path: string) {}

  read(path: string): Promise<Buffer> {
    return Promise.resolve(Buffer.from(''));
  }

  getStream(path: string): Promise<Readable> {
    return Promise.resolve(new Readable());
  }

  upload(buffer: Buffer | ReadStream | ArrayBuffer, filename: string) {}
}
