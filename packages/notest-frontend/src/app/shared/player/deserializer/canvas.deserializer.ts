import { DomDeserializer } from "./dom.deserializer";
import { DOMDeserializerHelper } from "./deserializer.utils";
import { DOMJson } from "@notest/common";

export class CanvasDomDeserializer implements DomDeserializer {
  deserialize(json: DOMJson, doc: Document): Node {
    let node = doc.createElement("canvas");
    const image = document.createElement("img");
    image.src = json.dataUrl ?? "";
    image.onload = () => {
      try {
        const ctx = node.getContext("2d");
        if (ctx) {
          ctx.drawImage(image as any, 0, 0, image.width, image.height);
        }
      } catch (e) {
        console.log("Could not deserialize canvas URL", e);
      }
    };
    let dsh = new DOMDeserializerHelper();
    dsh.applyAttributes(node, json);
    return node;
  }
}
