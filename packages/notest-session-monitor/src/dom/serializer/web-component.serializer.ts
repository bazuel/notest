import { DomSerializer } from './dom.serializer';
import { ElementSerializer } from './element.serializer';
import { DOMSerializerHelper } from './serializer.utils';
import { DOMJson } from '../../model/dom.event';

export class WebComponentDomSerializer implements DomSerializer {
  constructor(private elementDomSerializer: ElementSerializer) {}

  serialize(n: Node): DOMJson {
    let dsh = new DOMSerializerHelper();
    let { element, tag, attributes } = dsh.nodeElementTagAttributes(n);
    let w = n as any;

    const serialize = (c) => this.elementDomSerializer.serialize(c);

    let children: DOMJson[] = [];
    let shadowStyle = '';
    let shadowMode: 'open' | 'closed' = 'open';
    let shadowChildren: DOMJson[] = [];
    let shadow: any = null;
    let shadowRoot = element.shadowRoot || w._closed_mode_shadowRoot;
    let isDocumentFragment = () => {
      try {
        return (
          shadowRoot.$$OwnerKey$$ ||
          shadowRoot.constructor.prototype.nodeName == '#document-fragment'
        );
      } catch (e) {
        return false;
      }
    };
    if (shadowRoot) {
      try {
        let innerStyle = [...shadowRoot.adoptedStyleSheets[0].rules]
          .map((r) => {
            let css = dsh.getAbsoluteUrlsStylesheet(r.cssText);
            return css;
          })
          .join('');
        shadowStyle = innerStyle;
      } catch (e) {
        //console.log("could not grab inner style")
      }

      shadowMode = shadowRoot.mode;

      for (let c of shadowRoot.childNodes) shadowChildren.push(serialize(c));

      shadow = {
        children: shadowChildren,
        mode: shadowMode,
        shadowType: isDocumentFragment() ? 'document-fragment' : 'shadow-dom',
        style: shadowStyle
      };
    }
    for (let c of w.childNodes) children.push(serialize(c));

    if (isDocumentFragment()) shadow.documentFragment = serialize(element.shadowRoot);

    return { children, tag, attributes, shadow, type: 'web-component' };
  }
}
