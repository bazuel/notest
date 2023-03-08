import { Controller, Get, Query } from '@nestjs/common';
import { StorageService } from '../shared/services/storage.service';
import { pathSessionFromReference } from '@notest/common';
import { ScreenshotComparator } from '@notest/backend-shared';

@Controller('comparator')
export class ComparatorController {
  private screenshotComparator: ScreenshotComparator;

  constructor(private storageService: StorageService) {
    this.screenshotComparator = new ScreenshotComparator();
  }

  @Get('screenshot')
  async compareScreenshot(
    @Query('first_session') firstSessionReference: string,
    @Query('second_session') secondSessionReference: string
  ) {
    const firstSessionScreenshots = await this.screenshotsFromReference(firstSessionReference);
    const secondSessionScreenshot = await this.screenshotsFromReference(secondSessionReference);
    await this.screenshotComparator.compareList(firstSessionScreenshots, secondSessionScreenshot);
  }

  private async screenshotsFromReference(sessionReference: string) {
    let screenshotReferences = (await this.storageService.list(
      pathSessionFromReference(encodeURIComponent(sessionReference)).replace('/session.zip', '')
    )) as unknown as { Key: string }[];

    screenshotReferences = screenshotReferences.filter(
      (element) => element.Key.split('/').pop() !== 'session.zip'
    );

    return await Promise.all(
      screenshotReferences.map(async (element) => {
        const name = element.Key.split('/').pop().split('_').shift();
        return { name, data: await this.storageService.read(element.Key) };
      })
    );
  }
}
