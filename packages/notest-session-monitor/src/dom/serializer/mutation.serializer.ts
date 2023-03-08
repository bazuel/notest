import { DOMSerializerHelper } from './serializer.utils';
import { ElementSerializer } from './element.serializer';
import { ElidGenerator } from './elid.generator';
import { StyleAttributeSerializer } from './style-attribute.serializer';
import { BLMutationEventData } from '../../model/dom.event';

export class MutationSerializer {
  constructor(
    private elementsMap: Map<Node, number>,
    private elIdGenerator: ElidGenerator,
    private serializer: ElementSerializer
  ) {}

  serialize(mutations: (MutationRecord & { timestamp: number })[]): BLMutationEventData[] {
    const elementAttributesMap = new Map<
      Node,
      { timestamp: number; attributes: BLMutationEventData['attributes'] }
    >();
    const elementStylesMap = new Map<
      Node,
      { oldValue: string; styles: BLMutationEventData['styles']; timestamp: number }
    >();
    const elementTextMap = new Map<Node, { text: string; timestamp: number }>();

    mutations.sort((e1, e2) => {
      return e1.timestamp - e2.timestamp;
    });

    const dsh = new DOMSerializerHelper();
    const removeRecursivelyFromElementsMap = (n: Node) => {
      this.elementsMap.delete(n);
      n.childNodes.forEach((c) => removeRecursivelyFromElementsMap(c));
    };

    let eventMutations: BLMutationEventData[] = [];

    for (let m of mutations) {
      if (m.type == 'attributes' && m.attributeName) {
        const target = m.target as HTMLElement;
        const attributeValue = target.getAttribute(m.attributeName);
        if (m.attributeName == 'style' && attributeValue && attributeValue.length > 100) {
          if (!elementStylesMap.has(target)) {
            let styles = new StyleAttributeSerializer().serialize(target, m.oldValue ?? '');
            elementStylesMap.set(target, {
              styles,
              oldValue: m.oldValue ?? '',
              timestamp: m.timestamp
            });
          }
          let oldValue = elementStylesMap.get(target)!.oldValue;
          let styles = new StyleAttributeSerializer().serialize(target, oldValue);
          elementStylesMap.get(target)!.styles = styles;
          elementStylesMap.get(target)!.timestamp = m.timestamp;
        } else {
          let value = dsh.serializeAttribute(m.attributeName, attributeValue ?? null);
          if (!elementAttributesMap.has(target)) {
            let attributes = {};
            attributes[m.attributeName] = value;
            elementAttributesMap.set(target, { attributes, timestamp: m.timestamp });
          }
          const prevAttributes = elementAttributesMap.get(target)!.attributes!;
          const attrName = m.attributeName;
          prevAttributes[attrName] = value;
          elementAttributesMap.get(target)!.timestamp = m.timestamp;
        }
      } else if (m.type == 'characterData') {
        const value = m.target.textContent ?? '';
        elementTextMap.set(m.target, { text: value, timestamp: m.timestamp });
      } else if (m.type == 'childList') {
        m.addedNodes.forEach((c) => {
          eventMutations.push(this.generateAddEvent(c, m.target, m.timestamp));
        });
        m.removedNodes.forEach((c) => {
          let re = this.generateRemoveEvent(c, m.target, m.timestamp);
          eventMutations.push(re);
          removeRecursivelyFromElementsMap(c); // TODO maybe we can avoid removing nodes from map to reuse node removed and readded in DOM
        });
      }
    }

    elementAttributesMap.forEach((e, n) => {
      let ae = this.generateAttributeMutationEvent(n, e.attributes, e.timestamp);
      eventMutations.push(ae);
    });

    elementStylesMap.forEach((e, n) => {
      eventMutations.push(this.generateStyleAttributeMutationEvent(n, e.styles, e.timestamp));
    });
    elementTextMap.forEach((e, n) => {
      eventMutations.push(this.generateTextMutationEvent(n, e.text, e.timestamp));
    });

    return eventMutations;
  }

  private generateAddEvent(n: Node, parent: Node, timestamp: number) {
    let serialized: BLMutationEventData = this.serializer.serialize(
      n
    ) as unknown as BLMutationEventData;
    serialized.after = this.elId(n.nextSibling);
    serialized.before = this.elId(n.previousSibling);
    serialized.parent = this.elId(parent);
    return { ...serialized, timestamp, name: 'mutation-add' } as BLMutationEventData;
  }

  private generateAttributeMutationEvent(a: Node, attributes, timestamp: number) {
    return {
      name: 'mutation-attribute',
      attributes,
      id: this.elId(a),
      timestamp
    } as BLMutationEventData;
  }

  private generateStyleAttributeMutationEvent(
    a: Node,
    styles: BLMutationEventData['styles'],
    timestamp: number
  ) {
    return {
      name: 'mutation-style',
      styles,
      id: this.elId(a),
      timestamp
    } as BLMutationEventData;
  }

  private generateTextMutationEvent(t: Node, value: string, timestamp: number) {
    return {
      name: 'mutation-text',
      text: value,
      id: this.elId(t),
      timestamp
    } as BLMutationEventData;
  }

  private generateRemoveEvent(c: Node, parent: Node, timestamp: number) {
    return {
      name: 'mutation-remove',
      parent: this.elId(parent),
      id: this.elId(c),
      timestamp
    } as BLMutationEventData;
  }

  private elId(n) {
    return this.elIdGenerator.id(n);
  }
}
