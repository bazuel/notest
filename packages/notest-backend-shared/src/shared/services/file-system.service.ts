import { StorageService } from './storage.service.interface';
import {
  createReadStream,
  mkdirSync,
  readFile,
  ReadStream,
  unlink,
  writeFile,
  existsSync
} from 'fs';
import { streamToBuffer } from '@notest/common';
import { Readable } from 'stream';

export class FileSystemService implements StorageService {
  constructor(private root: string) {}

  delete(path: string) {
    return new Promise((s, e) => {
      unlink(this.fullPath(path), (err) => {
        if (err) e({ error: err });
        else e(s);
      });
    });
  }

  getStream(path: string): Promise<Readable> {
    return new Promise((s, e) => {
      const stream = createReadStream(this.fullPath(path)).on('error', (err) => e(err));
      s(stream);
    });
  }

  list() {}

  read(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      readFile(this.fullPath(path), (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  async upload(buffer: Buffer | ReadStream | ArrayBuffer, filename: string) {
    const data = buffer instanceof ReadStream ? await streamToBuffer(buffer) : Buffer.from(buffer);
    return new Promise<void>((resolve, reject) => {
      this.createDirectoryIfNotExists(this.fullPath(filename));
      writeFile(this.fullPath(filename), data, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private fullPath(path: string) {
    return (this.root + path).replace(/\\/g, '/');
  }

  private createDirectoryIfNotExists(path: string) {
    const fileNameIndex = path.lastIndexOf('/') || path.lastIndexOf('\\');
    path = path.substring(0, fileNameIndex);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  }
}
