import { DomSerializer } from './dom.serializer';
import { DOMSerializerHelper } from './serializer.utils';
import { DOMJson } from '../../model/dom.event';

export class FormDomSerializer implements DomSerializer {
  serialize(n: Node): DOMJson {
    let dsh = new DOMSerializerHelper();
    let { tag, attributes } = dsh.nodeElementTagAttributes(n);
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      const value = (n as HTMLInputElement | HTMLTextAreaElement).value;
      if (attributes['type'] !== 'radio' && attributes['type'] !== 'checkbox' && value) {
        attributes['value'] = value;
      } else if ((n as HTMLInputElement).checked) {
        attributes['checked'] = (n as HTMLInputElement).checked + '';
      }
      return { type: tag, tag, attributes };
    } else if (tag === 'option') {
      const selectValue = (n as HTMLOptionElement).parentElement;
      if (attributes['value'] === (selectValue as HTMLSelectElement).value) {
        attributes['selected'] = (n as HTMLOptionElement).selected + '';
      }
      return { type: 'option', tag, attributes };
    } else return { type: tag, tag, attributes };
  }
}
