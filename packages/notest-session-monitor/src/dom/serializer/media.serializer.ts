import { DOMSerializerHelper } from './serializer.utils';
import { DomSerializer } from './dom.serializer';
import { DOMJson } from '../../model/dom.event';

export class MediaDomSerializer implements DomSerializer {
  serialize(n: Node): DOMJson {
    let dsh = new DOMSerializerHelper();
    let { tag, attributes } = dsh.nodeElementTagAttributes(n);
    let state: 'pause' | 'play' = (n as HTMLMediaElement).paused ? 'pause' : 'play';
    return { type: tag, tag, attributes, state };
  }
}
