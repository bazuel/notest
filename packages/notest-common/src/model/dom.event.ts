import { BLEvent } from './events';

export interface DOMJson {
  tag?: string;
  name?: string;
  publicId?: string;
  systemId?: string;
  textContent?: string;
  id?: number;
  shadow?: {
    children: DOMJson[];
    mode: 'open' | 'closed';
    style: string;
    documentFragment?: DOMJson;
    shadowType?: 'document-fragment' | 'shadow-dom';
  }; //for web-components
  type:
    | '#document-fragment'
    | 'error'
    | 'svg'
    | 'comment'
    | 'cdata'
    | 'audio'
    | 'video'
    | 'text'
    | 'script-text'
    | 'css-text'
    | 'canvas'
    | 'input'
    | 'textarea'
    | 'select'
    | 'option'
    | 'web-component'
    | 'document'
    | 'doc-type'
    | 'style'
    | 'link-stylesheet'
    | string;
  attributes?: { [member: string]: string | null };
  styles?: { [property: string]: string | null };
  css?: string; // for link and style tags
  dataUrl?: string; // for canvas
  text?: string; // for text
  script?: string; // for script
  state?: 'play' | 'pause'; // for audio and video
  content?: string; // for errors
  width?: number;
  height?: number;
  children?: DOMJson[];
  href?: string;
  scroll?: { x: number; y: number };
}

export interface DOMJsonElement extends DOMJson {
  tag: string;
  text?: string;
  children?: DOMJsonElement[];
}

export interface BLMutationEventData extends Partial<DOMJson> {
  name:
    | 'mutation-attribute'
    | 'mutation-add'
    | 'mutation-remove'
    | 'mutation-text'
    | 'mutation-style';
  text?: string;
  children?: DOMJson[];
  attributes?: { [attributeName: string]: string | null };
  styles?: { [propertyName: string]: string | null };
  id: number;
  parent?: number;
  before?: number;
  after?: number;
  timestamp: number;
}

export interface BLDomEvent extends BLEvent {
  type: 'dom';
  name: 'dom-full' | 'dom-change';
  mutations?: BLMutationEventData[];
  full?: DOMJson;
}

export interface BLDomMapEvent extends BLEvent {
  map: Map<Node, number>;
  serializer: { serialize };
}
