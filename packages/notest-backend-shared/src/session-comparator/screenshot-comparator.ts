import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export class ScreenshotComparator {
  async compareList(currentScreenshots: NTScreenshot[], previousScreenshots: NTScreenshot[]) {
    for (const currentScreenshot of currentScreenshots) {
      const similarScreenshot = this.findSimilarScreenshot(previousScreenshots, currentScreenshot);
      if (similarScreenshot) {
        previousScreenshots = this.removeCurrentScreenshotFromList(
          previousScreenshots,
          similarScreenshot
        );
        await this.compare(similarScreenshot, currentScreenshot);
      } else {
        console.log('Similar screenshot not found', currentScreenshot.name);
      }
    }
  }

  private removeCurrentScreenshotFromList(
    previousScreenshots: NTScreenshot[],
    similarScreenshot: { name: string; data: Buffer }
  ) {
    const indexScreenshot = previousScreenshots.indexOf(similarScreenshot);
    return previousScreenshots.filter((screenshot, index) => index !== indexScreenshot);
  }

  async compare(similarScreenshot: NTScreenshot, currentScreenshot: NTScreenshot) {
    const similarScreenshotPng = PNG.sync.read(similarScreenshot.data);
    const currentScreenshotPng = PNG.sync.read(currentScreenshot.data);
    const { width, height } = similarScreenshotPng;
    const diff = new PNG({ width, height });
    const numberOfPixels = pixelmatch(
      similarScreenshotPng.data,
      currentScreenshotPng.data,
      diff.data,
      width,
      height
    );
    const current = await this.getPrimaryColor(currentScreenshot);
    const similar = await this.getPrimaryColor(similarScreenshot);
    let samePrimaryColor = 0;
    if (current.primaryColor === similar.primaryColor) {
      samePrimaryColor =
        current.primaryColorCount < similar.primaryColorCount
          ? current.primaryColorCount
          : similar.primaryColorCount;
    }
    console.log(
      `number of different pixel are: ${(
        (numberOfPixels * 100) /
        (diff.width * diff.height - samePrimaryColor)
      ).toPrecision(3)}%`
    );
  }

  private async getPrimaryColor(similarScreenshot: NTScreenshot) {
    let bucket = { black: 0, white: 0 };
    let png = new PNG({ filterType: 4, colorType: 0 });
    await new Promise<void>((resolve) => {
      png.parse(similarScreenshot.data, (err, img) => {
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            let idx = (img.width * y + x) << 2;
            if (img.data[idx] >= 128) bucket.white++;
            else bucket.black++;
          }
        }
        resolve();
      });
    });
    let primaryColor = bucket.black > bucket.white ? 'black' : 'white';
    let primaryColorCount = bucket.black > bucket.white ? bucket.black : bucket.white;
    return { primaryColor, primaryColorCount };
  }

  private findSimilarScreenshot(
    previousScreenshots: { name: string; data: Buffer }[],
    currentScreenshot: { name: string; data: Buffer }
  ) {
    return previousScreenshots.find((e) => e.name === currentScreenshot.name);
  }
}

//TODO: remove after test
export function crop1PxBorder(image: Buffer) {
  let sourceImg = PNG.sync.read(image);
  let extractedImage = new PNG({ width: sourceImg.width - 2, height: sourceImg.height - 2 });
  PNG.bitblt(sourceImg, extractedImage, 1, 1, sourceImg.width - 2, sourceImg.height - 2);
  return extractedImage;
}
export function cropImage(image: Buffer, rect: DOMRect) {
  let sourceImg = PNG.sync.read(image);
  let extractedImage = new PNG({ width: rect.width, height: rect.height });
  PNG.bitblt(sourceImg, extractedImage, rect.x, rect.y, rect.width, rect.height);
  return extractedImage;
}

export function cropOriginalImage(image: Buffer, rect: DOMRect) {
  let sourceImg = PNG.sync.read(image);
  let extractedImage = new PNG({ width: rect.width, height: rect.height });
  PNG.bitblt(sourceImg, extractedImage, rect.x + 1, rect.y + 1, rect.width, rect.height);
  return extractedImage;
}

export function PNGtoBuffer(image: PNG) {
  return PNG.sync.write(image);
}

export function compareImage(image1: PNG, image2: PNG) {
  const { width, height } = image1;
  const diff = new PNG({ width, height });
  const numberOfPixels = pixelmatch(image1.data, image2.data, diff.data, width, height);
  const similarPercent = ((width * height - numberOfPixels) * 100) / (width * height);
  console.log(`number of different pixel are: ${numberOfPixels} of ${width * height} total pixel`);
  return { imageDiff: diff, pixelMismatch: Number(similarPercent.toFixed(2)) };
}

type NTScreenshot = { name: string; data: Buffer };
