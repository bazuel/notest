import { globalConfig } from './config.service';
import { S3Service } from './s3.service';
import { FileSystemService } from './file-system.service';

export const storageService = storageStrategy(globalConfig.storage.type);

function storageStrategy(type: 'cloud' | 'local') {
  if (type === 'cloud') return new S3Service(globalConfig.storage);
  else if (type === 'local') return new FileSystemService(globalConfig.storage.root);
}
