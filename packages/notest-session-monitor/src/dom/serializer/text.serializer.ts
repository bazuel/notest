import { DomSerializer } from './dom.serializer';
import { DOMSerializerHelper } from './serializer.utils';
import { DOMJson } from '../../model/dom.event';

export class TextDomSerializer implements DomSerializer {
  serialize(n: Node): DOMJson {
    let doms = new DOMSerializerHelper();
    const parentTagName = n.parentNode && (n.parentNode as HTMLElement).tagName;
    let textContent = (n as Text).textContent ?? '';
    const isStyle = parentTagName === 'STYLE' ? true : undefined;
    if (isStyle && textContent) {
      return {
        type: 'css-text',
        css: doms.getAbsoluteUrlsStylesheet(textContent)
      };
    }
    if (parentTagName === 'SCRIPT') {
      return {
        type: 'script-text',
        script: textContent.replace(/\n/g, '\n\\\\')
      };
    }
    let type = 'text';
    return {
      type,
      text: textContent || ''
    };
  }
}
