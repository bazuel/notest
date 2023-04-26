import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export function cropImage(image: Buffer, rect: DOMRect) {
  let sourceImg = PNG.sync.read(image);
  let extractedImage = new PNG({ width: rect.width, height: rect.height });
  PNG.bitblt(sourceImg, extractedImage, rect.x, rect.y, rect.width, rect.height);
  return extractedImage;
}

export function cropImageAndShift1Px(image: Buffer, rect: DOMRect) {
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
