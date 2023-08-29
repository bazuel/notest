import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export function cropImage(image: Buffer, rect: DOMRect) {
  let sourceImg = PNG.sync.read(image);
  let extractedImage = new PNG({ width: rect.width, height: rect.height });
  PNG.bitblt(sourceImg, extractedImage, rect.x, rect.y, rect.width, rect.height);
  return extractedImage;
}

export function cropImageAndShift1Px(image: Buffer, rect: DOMRect): PNG {
  let sourceImg = PNG.sync.read(image);
  try {
    let extractedImage = new PNG({ width: rect.width, height: rect.height });
    PNG.bitblt(sourceImg, extractedImage, rect.x + 1, rect.y + 1, rect.width, rect.height);
    return extractedImage;
  } catch (error) {
    return sourceImg;
  }
}

export function PNGtoBuffer(image: PNG) {
  return PNG.sync.write(image);
}

export function compareImage(image1: PNG, image2: PNG) {
  const { width, height } = image1;
  const primaryColor1 = getPrimaryColor(image1);
  const primaryColor2 = getPrimaryColor(image2);
  let totalPixels = width * height;

  const diff = new PNG({ width, height });
  const numberOfPixels = pixelmatch(image1.data, image2.data, diff.data, width, height);

  if (primaryColor1.primaryColor != primaryColor2.primaryColor) {
    console.log(
      `primary color are different: ${primaryColor1.primaryColor} vs ${primaryColor2.primaryColor}`
    );
    return { imageDiff: diff, pixelMismatch: 100 };
  } else {
    console.log(
      `primary color are the same: ${primaryColor1.primaryColor} vs ${primaryColor2.primaryColor}`
    );
  }

  console.log('version 1');
  if (primaryColor1.primaryColorPercent >= 99) return { imageDiff: diff, pixelMismatch: 0 };

  totalPixels = totalPixels - primaryColor1.primaryColorPixelNumber;

  const similarPercent = ((totalPixels - numberOfPixels) * 100) / totalPixels;
  console.log(`number of different pixel are: ${numberOfPixels} of ${totalPixels} total pixel`);
  return { imageDiff: diff, pixelMismatch: Number(similarPercent.toFixed(2)) };
}

export function getPrimaryColor(image: PNG) {
  const { width, height } = image;
  const colors: { [color: string]: number } = {};
  for (let i = 0; i < image.data.length; i += 4) {
    const pixel = image.data.slice(i, i + 4);
    const color = pixel.join(',');
    if (colors[color]) colors[color]++;
    else colors[color] = 1;
  }
  const primaryColor = Object.keys(colors).reduce((a, b) => (colors[a] > colors[b] ? a : b));
  const primaryColorPixelNumber = colors[primaryColor];
  const primaryColorPercent = (colors[primaryColor] * 100) / (width * height);
  return { primaryColor, primaryColorPercent, primaryColorPixelNumber };
}
