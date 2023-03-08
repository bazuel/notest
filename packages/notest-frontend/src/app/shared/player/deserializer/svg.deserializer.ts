import { DomDeserializer } from "./dom.deserializer";
import { ElementDeserializer } from "./element.deserializer";
import { DOMDeserializerHelper } from "./deserializer.utils";
import { DOMJsonElement } from "@notest/common";

export const svgCaseSensitiveTags = {
  altglyph: "altGlyph",
  altglyphdef: "altGlyphDef",
  altglyphitem: "altGlyphItem",
  animatecolor: "animateColor",
  animatemotion: "animateMotion",
  animatetransform: "animateTransform",
  clippath: "clipPath",
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedistantlight: "feDistantLight",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fefunca: "feFuncA",
  fefuncb: "feFuncB",
  fefuncg: "feFuncG",
  fefuncr: "feFuncR",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femergenode: "feMergeNode",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fepointlight: "fePointLight",
  fespecularlighting: "feSpecularLighting",
  fespotlight: "feSpotLight",
  fetile: "feTile",
  feturbulence: "feTurbulence",
  foreignobject: "foreignObject",
  glyphref: "glyphRef",
  lineargradient: "linearGradient",
  radialgradient: "radialGradient",
  solidcolor: "solidColor",
  textarea: "textArea",
  textpath: "textPath",
};

export class SvgDomDeserializer implements DomDeserializer {
  constructor(private elementDomSerializer: ElementDeserializer) {}

  deserialize(json: DOMJsonElement, doc: Document): Node {
    let dsh = new DOMDeserializerHelper();
    const explore = (j: DOMJsonElement) => {
      if (j.type == "text" && !j.tag) {
        return doc.createTextNode(j.text!);
      } else {
        const t = (
          j.tag ?? ""
        ).toLowerCase() as keyof typeof svgCaseSensitiveTags;
        let tag: string = svgCaseSensitiveTags[t] ?? j.tag;
        let n = doc.createElementNS("http://www.w3.org/2000/svg", tag);
        if (j.children) {
          for (let c of j.children) {
            let child = explore(c);
            n.appendChild(child);
          }
        }
        dsh.applyAttributes(n, j);

        if (this.elementDomSerializer.onNodeDeserialized)
          this.elementDomSerializer.onNodeDeserialized(n, j);
        return n;
      }
    };

    return explore(json);
  }
}
