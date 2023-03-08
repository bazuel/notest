import { DOMJsonElement } from "@notest/common";
import { DomDeserializer } from "./dom.deserializer";
import { DOMDeserializerHelper } from "./deserializer.utils";
import { CanvasDomDeserializer } from "./canvas.deserializer";
import { FormDomDeserializer } from "./form.deserializer";
import { SvgDomDeserializer } from "./svg.deserializer";
import { TextDomDeserializer } from "./text.deserializer";
import { WebComponentDomDeserializer } from "./web-component.deserializer";
import { CssAbsoluteUrlTransformer } from "../shared/css-absolute-url.transformer";

export class ElementDeserializer implements DomDeserializer {
  constructor(
    public onNodeDeserialized?: (node: Node, json: any) => void,
    private options = { proxyBasePath: "" }
  ) {}

  deserialize(json: DOMJsonElement, doc: Document) {
    const explore = (j: DOMJsonElement) => {
      let n = this.deserializeSingle(j, doc);
      if (j.children && j.tag != "svg") {
        for (let c of j.children) {
          let child = explore(c);
          n.appendChild(child);
        }
      }
      if (this.onNodeDeserialized) this.onNodeDeserialized(n, j);
      return n;
    };
    return explore(json);
  }

  private deserializeSingle(json: DOMJsonElement, doc: Document) {
    let node;
    switch (json.type) {
      case "#document-fragment":
        node = new DocumentFragment();
        break;
      case "web-component":
        node = new WebComponentDomDeserializer(this).deserialize(json, doc);
        break;
      case "svg":
        node = new SvgDomDeserializer(this).deserialize(json, doc);
        break;
      case "document":
        doc.close();
        doc.open();
        node = doc;
        break;
      case "doc-type":
        node = doc.implementation.createDocumentType(
          json.name as string,
          json.publicId as string,
          json.systemId as string
        );
        break;
      case "style":
        {
          node = this.deserializeElement(json as DOMJsonElement, doc);
          if (json.css && json.css?.length > 0) {
            let cssNode = document.createTextNode(json.css || "");
            node.appendChild(cssNode);
          }
        }
        break;
      case "css-text":
      case "script-text":
        node = new TextDomDeserializer().deserialize(json, doc);
        break;
      case "cdata":
        node = doc.createCDATASection(json.text!);
        break;
      case "comment":
        node = doc.createComment(json.text!);
        break;
      default: {
        if (json.type == "text" && json.tag! != "text")
          node = new TextDomDeserializer().deserialize(json, doc);
        else node = this.deserializeElement(json as DOMJsonElement, doc);
      }
    }
    return node;
  }

  private deserializeElement(json: DOMJsonElement, doc: Document) {
    let node;
    let tag = json.tag;
    switch (tag) {
      case "iframe":
        node = document.createElement("iframe");
        break;
      case "canvas":
        node = new CanvasDomDeserializer().deserialize(json, doc);
        break;
      case "input":
      case "textarea":
      case "select":
      case "option":
        node = new FormDomDeserializer().deserialize(json, doc);
        break;
      case "audio":
      case "video":
        node = document.createElement(tag);
        break;
      case "link":
        if (json.type == "link-stylesheet" && json.css) {
          node = document.createElement("style");
          if (json.attributes && json.attributes["href"])
            node.setAttribute("link-href", json.attributes["href"]);
          node.innerHTML = new CssAbsoluteUrlTransformer().proxyUrls(
            json.css,
            this.options.proxyBasePath + "/proxy/?url="
          );
        } else {
          node = document.createElement("link");
          node.setAttribute("crossorigin", "");
          if (json.attributes && json.attributes["href"])
            node.setAttribute(
              "href",
              this.options.proxyBasePath +
                `/proxy/?url=${json.attributes["href"]}`
            );
        }
        break;
      case "script":
        node = document.createElement("noscript");
        break;
      default: {
        let svgTag = this.isSvgTag(json.tag);
        if (svgTag)
          node = document.createElementNS(
            "http://www.w3.org/2000/svg",
            json.tag
          );
        else node = document.createElement(json.tag);
      }
    }
    new DOMDeserializerHelper().applyAttributes(node as HTMLElement, json);
    return node;
  }

  private isSvgTag(tag: string) {
    return (
      [
        "path",
        "animate",
        "animateMotion",
        "animateTransform",
        "circle",
        "clipPath",
        "color-profile",
        "defs",
        "desc",
        "discard",
        "ellipse",
        "feBlend",
        "feColorMatrix",
        "feComponentTransfer",
        "feComposite",
        "feConvolveMatrix",
        "feDiffuseLighting",
        "feDisplacementMap",
        "feDistantLight",
        "feDropShadow",
        "feFlood",
        "feFuncA",
        "feFuncB",
        "feFuncG",
        "feFuncR",
        "feGaussianBlur",
        "feImage",
        "feMerge",
        "feMergeNode",
        "feMorphology",
        "feOffset",
        "fePointLight",
        "feSpecularLighting",
        "feSpotLight",
        "feTile",
        "feTurbulence",
        "filter",
        "foreignObject",
        "g",
        "hatch",
        "hatchpath",
        "image",
        "line",
        "linearGradient",
        "marker",
        "mask",
        "mesh",
        "meshgradient",
        "meshpatch",
        "meshrow",
        "metadata",
        "mpath",
        "path",
        "pattern",
        "polygon",
        "polyline",
        "radialGradient",
        "rect",
        "script",
        "set",
        "solidcolor",
        "stop",
        "style",
        "svg",
        "_switch",
        "symbol",
        "text",
        "textPath",
        "title",
        "tspan",
        "unknown",
        "use",
        "view",
      ].indexOf(tag) >= 0
    );
  }
}
