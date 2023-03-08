import { DomDeserializer } from "./dom.deserializer";
import { DOMJsonElement } from "@notest/common";

export class TextDomDeserializer implements DomDeserializer {
  deserialize(json: DOMJsonElement, document: Document): Node {
    let node = document.createTextNode(
      json.text || json.css || json.script || ""
    );
    return node;
  }
}
