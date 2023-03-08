import { DomSerializer } from './dom.serializer';
import { DOMSerializerHelper } from './serializer.utils';
import { DOMJson } from '../../model/dom.event';

export class CanvasDomSerializer implements DomSerializer {
  serialize(n: Node): DOMJson {
    let dsh = new DOMSerializerHelper();
    let attributes = dsh.getElementAttributes(n);
    let dataUrl = (n as HTMLCanvasElement).toDataURL();
    return { type: 'canvas', tag: 'canvas', dataUrl, attributes };
  }
}
