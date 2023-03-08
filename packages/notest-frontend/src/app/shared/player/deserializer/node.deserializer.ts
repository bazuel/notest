import { DomDeserializer } from "./dom.deserializer";
import { ElementDeserializer } from "./element.deserializer";
import { DOMJson, DOMJsonElement } from "@notest/common";

export class NodeDeserializer implements DomDeserializer {
  private deserializedMap!: Map<number, Node>;
  private lastId: number = 0;

  constructor(
    private win: Window = window,
    private deserializer?: ElementDeserializer
  ) {}

  deserialize(json: DOMJson, doc?: Document): Node {
    let d = doc ?? document;
    if (!this.deserializer) {
      this.deserializedMap = new Map<number, Node>();
      this.deserializer = new ElementDeserializer((n, j) => {
        if (!this.deserializedMap.has(j.id)) {
          this.deserializedMap.set(j.id, n);
        }
        if (j.id) this.lastId = Math.max(this.lastId, j.id);
      });
    }
    let node = this.deserializer.deserialize(json as DOMJsonElement, d);
    return node;
  }
}
