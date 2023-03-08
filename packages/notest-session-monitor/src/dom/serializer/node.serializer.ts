import { DomSerializer } from './dom.serializer';
import { ElementSerializer } from './element.serializer';
import { DOMJson } from '../../model/dom.event';

export class NodeSerializer implements DomSerializer {
  serializedMap!: Map<Node, number>;
  lastId: number = 0;

  constructor(private win = window) {}

  serialize(n: Node, elementsMap?: Map<Node, number>): DOMJson {
    this.serializedMap = elementsMap ? elementsMap : new Map<Node, number>();
    let id = 0;
    if (elementsMap && elementsMap.size > 0) {
      let ids = Array.from(elementsMap.values());
      id = Math.max(...ids) + 100;
    }
    let eds = new ElementSerializer((n, j) => {
      if (!this.serializedMap.has(n)) {
        id++;
        this.serializedMap.set(n, id);
        /*// for debugging
                    try{
                        (n as HTMLElement).setAttribute("data-blid", id+'')
                    } catch (e){}
                    console.log("serialized: ", id, this.serializedMap.get(n), n)
                 */
        this.lastId = id;
      }
      j.id = this.serializedMap.get(n);
    }, this.win);
    let json = eds.serialize(n);
    return json;
  }
}
