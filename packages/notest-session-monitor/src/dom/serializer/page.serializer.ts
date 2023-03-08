import { NodeSerializer } from './node.serializer';
import { DOMJson } from '../../model/dom.event';

export class PageSerializer {
  serialize(
    doc = document,
    win: any = window,
    elementsMap?: Map<Node, number>
  ): { json: DOMJson; elements: Map<Node, number>; lastId: number } {
    let ns = new NodeSerializer(win);
    let json = ns.serialize(doc, elementsMap);
    let elements = ns.serializedMap;
    let lastId = ns.lastId;
    return { json, elements, lastId };
  }
}
