export class LazyImagesRefresherApi {
  //private static gif1pxTransparent = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  refreshLazyImages(
    iframe: HTMLIFrameElement,
    options = { skipVisibleAreaCheck: false }
  ) {
    if (iframe.contentDocument && iframe.contentDocument.body) {
      let images =
        iframe.contentDocument!.body.querySelectorAll("img[data-blsrc]");
      images.forEach((img) => {
        const ibox = img.getBoundingClientRect();
        let srcIsStillTheLazyState =
          (img.getAttribute("src")?.indexOf("blsrc-lazy") ?? -1) >= 0;
        let imageInVisibleArea = ibox.top < iframe.contentWindow!.innerHeight;
        if (
          img.hasAttribute("data-blsrc") &&
          (imageInVisibleArea || options.skipVisibleAreaCheck)
        ) {
          if (srcIsStillTheLazyState)
            img.setAttribute("src", img.getAttribute("data-blsrc")!);
          img.removeAttribute("data-blsrc");
        }
      });
    }
  }

  manageLazyImage(
    node: HTMLImageElement,
    json: { width?: number; height?: number; attributes?: { src?: string } }
  ) {
    //only images with known width and height could be made lazy, otherwise we could have problems with scroll
    if (json.width && json.height) {
      node.setAttribute("data-blsrc", json.attributes?.src ?? "");
      node.setAttribute("src", this.imageBase64(json));
    }
  }

  private imageBase64(json: { width?: number; height?: number }) {
    return `data:image/svg+xml,<svg class='blsrc-lazy' xmlns='http://www.w3.org/2000/svg' width='${
      json.width ?? 1
    }' height='${json.height ?? 1}'></svg>`;
  }
}
