import { LazyImagesRefresherApi } from "./lazy-images-refresher.api";
import { DOMJson } from "@notest/common";

export class DOMDeserializerHelper {
  applyAttributes(node: HTMLElement | SVGElement, json: DOMJson) {
    if (json.attributes) {
      for (const name in json.attributes) {
        if (!json.attributes.hasOwnProperty(name)) {
          continue;
        }
        if (node.tagName == "LINK" && name == "href") continue;

        let value = json.attributes[name];
        value = typeof value === "boolean" ? "" : value;
        try {
          if (value !== null) {
            if (name === "xlink:href") {
              node.setAttributeNS("http://www.w3.org/1999/xlink", name, value);
            } else if (
              name == "onload" ||
              name == "onclick" ||
              name.substring(0, 7) == "onmouse"
            ) {
              // Rename some of the more common attributes from https://www.w3schools.com/tags/ref_eventattributes.asp
              // as setting them triggers a console.error (which shows up despite the try/catch)
              // Assumption: these attributes are not used to css
              node.setAttribute("_" + name, value);
            } else if (name == "rel") {
              if (value == "preload" && json.attributes["as"] == "style")
                node.setAttribute("rel", "stylesheet");
              else node.setAttribute("rel", value);
            } else if (name == "as") {
              //ignore as attribute managed by rel attribute above when as is style
              if (value != "style") node.setAttribute("as", value);
            } else {
              node.setAttribute(name, value);
            }
          } else if (value === null) {
            if (name === "xlink:href")
              node.removeAttributeNS("http://www.w3.org/1999/xlink", name);
            else node.removeAttribute(name);
          }
        } catch (error) {
          // skip invalid attribute
        }

        if (node.tagName == "IMG" && name == "src") {
          new LazyImagesRefresherApi().manageLazyImage(
            node as HTMLImageElement,
            json
          );
        }
      }
    }
    if (json.styles) {
      for (let a in json.styles) {
        if (json.styles[a] === null) {
          node.style.removeProperty(a);
        } else {
          let value = json.styles[a]!;
          let s = json.styles[a];
          let i = "";
          if (value.indexOf("!important") >= 0) {
            s = value.replace(" !important", "").replace("!important", "");
            i = "important";
          }
          node.style.setProperty(a, s, i);
        }
      }
    }
  }
}
