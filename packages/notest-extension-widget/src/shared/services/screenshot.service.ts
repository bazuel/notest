import * as htmlToImage from "html-to-image";
import { http } from "./http.service";

export async function capture(
  targets: HTMLElement[] | HTMLElement,
  rect: DOMRect
): Promise<{ img: Blob; url: string }> {
  let element = getParent(targets);
  const parentRect = element.getBoundingClientRect();
  let elementRect = getRelativeRectToParent(rect, parentRect);
  return htmlToImage
    .toCanvas(element)
    .then((canvas) => getUrlByCanvasCuttingByRect(canvas, elementRect));
}

function getParent(targets: HTMLElement[] | HTMLElement) {
  if (!Array.isArray(targets)) return targets;
  const parent = targets.reduce((acc, curr) => {
    if (acc === null) return curr.parentElement;
    if (acc.contains(curr)) return acc;
    if (curr.contains(acc)) return curr;
    return getParent([acc, curr.parentElement]);
  }, null);
  return parent;
}

const getRelativeRectToParent = (
  rect: DOMRect,
  parentRect: DOMRect
): Partial<DOMRect> => {
  const left = rect.left - parentRect.left;
  const top = rect.top - parentRect.top;
  return { left, top, width: rect.width, height: rect.height };
};

const getUrlByCanvasCuttingByRect = async (canvas: HTMLCanvasElement, rect) => {
  const { left, top, width, height } = rect;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(left, top, width, height);
  const newCanvas: HTMLCanvasElement = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext("2d");
  newCtx.putImageData(imgData, 0, 0);
  let img;
  await new Promise<void>((resolve) => {
    newCanvas.toBlob((blob) => {
      img = blob;
      resolve();
    });
  });
  return {
    url: newCanvas.toDataURL(),
    img,
  };
};

export function uploadScreenshot(
  image: { timestamp: Date; data: Blob; name: string },
  reference: string
) {
  const formData = new FormData();
  formData.append("reference", reference);
  formData.append("name", image.name);
  formData.append("timestamp", "" + image.timestamp.getTime());
  formData.append("file", image.data);
  return http.post("/media/screenshot-upload", formData);
}
