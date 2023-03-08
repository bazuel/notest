import { DomDeserializer } from "./dom.deserializer";
import { DOMDeserializerHelper } from "./deserializer.utils";
import { DOMJsonElement } from "@notest/common";

export class FormDomDeserializer implements DomDeserializer {
  deserialize(json: DOMJsonElement, document: Document): Node {
    let node = document.createElement(json.tag);
    if (json.tag == "textarea") {
      const child = document.createTextNode(
        json.attributes ? json.attributes["value"] ?? "" : ""
      );
      node.appendChild(child);
    }
    new DOMDeserializerHelper().applyAttributes(node, json);
    return node;
  }
}
