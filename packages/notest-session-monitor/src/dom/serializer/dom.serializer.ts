import { DOMJson } from '../../model/dom.event';

export interface DomSerializer {
  serialize(n: Node): DOMJson;
}
