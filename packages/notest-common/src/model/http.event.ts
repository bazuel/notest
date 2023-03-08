import { Json } from './json.type';
import { BLEvent } from './events';

export interface BLHTTPRequestEvent extends BLEvent {
  name: 'before-request';
  abort: boolean;
  originalCallback?: Function;
  path: string;
  async: boolean;
  handlers: { [event: string]: { handler: Function; useCapture: boolean }[] };
  headers: { [name: string]: string };
  password: string;
  method: string;
  user: string;
  url: string;
  timestamp: number;
  body?: string | Blob | Json;
  target: XMLHttpRequest;
}

export interface BLHTTPBeforeResponseEvent extends BLEvent {
  name: 'before-response';
  target: XMLHttpRequest;
  arguments: any[];
  abort: boolean;
  originalCallback?: Function;
  request: BLHTTPRequestEvent;
  timestamp: number;
}

export interface BLHTTPResponseEvent extends BLEvent {
  name: 'after-response';
  target: XMLHttpRequest;
  arguments: any[];
  headers: { [name: string]: string };
  body: string | Blob | Json;
  status: number;
  timestamp: number;
  request: BLHTTPRequestEvent;
  response: {
    body: string | Blob | Json;
    headers: { [name: string]: string };
    status: number;
    timestamp: number;
  }
}

export interface BLHTTPErrorEvent extends BLEvent {
  name: 'request-error';
  target: XMLHttpRequest;
  timestamp: number;
  request: BLHTTPRequestEvent;
}

export interface BLHTTPAbortEvent extends BLEvent {
  name: 'request-abort';
  target: XMLHttpRequest;
  timestamp: number;
  request: BLHTTPRequestEvent;
}

export interface BLHeaderEvent {

}