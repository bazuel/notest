import { DomSerializer } from './dom.serializer';
import { WebComponentDomSerializer } from './web-component.serializer';
import { TextDomSerializer } from './text.serializer';
import { DOMSerializerHelper } from './serializer.utils';
import { StylesheetDomSerializer } from './stylesheet.serializer';
import { MediaDomSerializer } from './media.serializer';
import { FormDomSerializer } from './form.serializer';
import { CanvasDomSerializer } from './canvas.serializer';
import { DOMJson } from '@notest/common';

export class ElementSerializer implements DomSerializer {
  constructor(public onNodeSerialized?: (node: Node, json) => void, private win = window) {}

  serialize(n: Node): DOMJson {
    let serialized: DOMJson;
    let isWebComponent =
      n.nodeName && n.nodeName.includes('-') && n.nodeName != '#document-fragment';
    if (isWebComponent) {
      serialized = new WebComponentDomSerializer(this).serialize(n);
    } else {
      let children: DOMJson[] = [];
      for (const child of Array.from(n.childNodes)) {
        let c = this.serialize(child);
        children.push(c);
      }

      const serializedNode = this.serializeSingle(n);
      serializedNode.children = children;
      serialized = serializedNode;
    }
    if (this.onNodeSerialized) this.onNodeSerialized(n, serialized);
    return serialized;
  }

  private serializeSingle(n: Node): DOMJson {
    switch (n.nodeType) {
      case n.DOCUMENT_NODE:
        return {
          type: 'document',
          href: this.win.location.href,
          width: this.win.innerWidth,
          height: this.win.innerHeight,
          scroll: { x: this.win.scrollX, y: this.win.scrollY }
        };
      case n.DOCUMENT_TYPE_NODE:
        return {
          type: 'doc-type',
          name: (n as DocumentType).name,
          publicId: (n as DocumentType).publicId,
          systemId: (n as DocumentType).systemId
        };
      case n.TEXT_NODE:
        return new TextDomSerializer().serialize(n);
      case n.CDATA_SECTION_NODE:
        return {
          type: 'cdata',
          textContent: ''
        };
      case n.COMMENT_NODE:
        return {
          type: 'comment',
          textContent: (n as Comment).textContent || ''
        };
      default:
        return this.serializeElement(n);
    }
  }

  private serializeElement(n: Node) {
    let dsh = new DOMSerializerHelper();
    let { element, tag, attributes } = dsh.nodeElementTagAttributes(n);
    let scroll = { x: element.scrollTop, y: element.scrollLeft };
    let json: DOMJson = { type: tag, tag, scroll };
    if (tag === 'link' || tag === 'style') {
      json = { ...json, ...new StylesheetDomSerializer().serialize(n) };
    } else if (tag === 'audio' || tag === 'video') {
      json = { ...json, ...new MediaDomSerializer().serialize(n) };
    } else if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'option')
      json = { ...json, ...new FormDomSerializer().serialize(n) };
    else if (tag === 'canvas') json = { ...json, ...new CanvasDomSerializer().serialize(n) };
    else
      json = {
        ...json,
        type: tag,
        tag,
        attributes
      };
    if (json.tag == 'img') {
      let img = n as HTMLImageElement;
      if (img.width && img.height) {
        json.width = img.width;
        json.height = img.height;
      } else {
        img.onload = () => {
          json.width = img.width;
          json.height = img.height;
        };
      }
    }
    return json;
  }
}
