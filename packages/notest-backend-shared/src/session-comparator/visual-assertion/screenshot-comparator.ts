import { mediaService } from '../../services/media.service';
import { compareImage, cropImage, cropImageAndShift1Px, PNGtoBuffer } from './image.utils';
import { NTScreenshot } from '@notest/common';

class ScreenshotComparator {
  async compare(reference: string, newReference: string, targetList: DOMRect[]) {
    let originalFinalImage = await mediaService.getScreenshot(
      decodeURIComponent(reference),
      'shot'
    );
    const newFinalImage = await mediaService.getScreenshot(
      decodeURIComponent(newReference),
      'final'
    );
    const assertionScreenshot: NTScreenshot[] = [];
    const imagesSimilarity: number[] = [];
    for (let i = 0; i < targetList.length; i++) {
      let rect = targetList[i];
      let origImg = cropImageAndShift1Px(originalFinalImage, rect);
      let newImg = cropImage(newFinalImage, rect);
      let { imageDiff, pixelMismatch } = compareImage(origImg, newImg);
      assertionScreenshot.push({
        name: `${i}-original`,
        data: PNGtoBuffer(origImg),
        fired: new Date(),
        type: 'assertion'
      });
      assertionScreenshot.push({
        name: `${i}-new`,
        data: PNGtoBuffer(newImg),
        fired: new Date(),
        type: 'assertion'
      });
      assertionScreenshot.push({
        name: `${i}-diff`,
        data: PNGtoBuffer(imageDiff),
        fired: new Date(),
        type: 'assertion'
      });
      imagesSimilarity.push(pixelMismatch);
    }
    return { assertionScreenshot, imagesSimilarity };
  }
}

export const screenshotComparator = new ScreenshotComparator();
