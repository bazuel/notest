import { DOMJson } from "@notest/common";

export interface DomDeserializer {
  deserialize(json: DOMJson, document: Document): Node;
}
