import { buildFetchHook } from '../utils/fetch.hook';
import {
  BLHTTPAbortEvent,
  BLHTTPBeforeResponseEvent,
  BLHTTPErrorEvent,
  BLHTTPRequestEvent,
  BLMonitor
} from '@notest/common';
import { blevent } from '../model/dispatched.events';

export class HttpMonitor implements BLMonitor {
  enabled = false;
  private native: any;
  fetch = self.fetch;

  constructor() {
    this.native = {
      fetch: self.fetch,
      Headers: self.Headers,
      Request: self.Request,
      Response: self.Response,
      xhr: {
        open: XMLHttpRequest.prototype.open
      }
    };
  }

  enable() {
    let { fetch } = buildFetchHook();
    window.fetch = fetch;
    enableXhrHook();
    this.enabled = true;
  }

  disable() {
    self.fetch = this.native.fetch;
    XMLHttpRequest.prototype.open = this.native.xhr.open;
  }
}

function enableXhrHook() {
  const origOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, async?, user?, pass?) {
    let baseUrl = '';
    if (url.indexOf('http') != 0) {
      baseUrl = window.location.protocol + '//' + window.location.hostname;
      if (!url.startsWith('/')) baseUrl += '/';
    }
    let xhr = this as any;
    xhr.blhandlers = {};
    let requestData: BLHTTPRequestEvent = {
      name: 'before-request',
      target: xhr,
      method: method,
      url: baseUrl + url,
      path: url,
      async: async,
      user: user,
      password: pass,
      timestamp: new Date().getTime(),
      headers: {},
      handlers: {},
      originalCallback: xhr.onreadystatechange,
      abort: false
    };

    xhr.httpData = {
      request: requestData,
      response: {}
    };

    let origSetRequestHeader = xhr.setRequestHeader;
    xhr.setRequestHeader = function (header, value) {
      origSetRequestHeader.apply(xhr, [header, value]);
      if (!xhr.httpData.request.headers[header]) {
        xhr.httpData.request.headers[header] = [];
      }
      xhr.httpData.request.headers[header].push(value);
    };

    let origSend = xhr.send;
    xhr.send = function (body: any) {
      if (body instanceof FormData) {
        let fbody = {};
        for (let pair of (body as any).entries()) {
          fbody[pair[0]] = pair[1];
        }
        xhr.httpData.request.body = fbody;
      } else {
        xhr.httpData.request.body = body;
      }

      let originalCallback = xhr.onreadystatechange;
      xhr.onreadystatechange = function (...rargs) {
        const responseData: BLHTTPBeforeResponseEvent = {
          name: 'before-response',
          target: xhr,
          arguments: rargs,
          originalCallback,
          abort: false,
          request: requestData,
          timestamp: new Date().getTime()
        };
        blevent.http.before_response(responseData);
        if (!responseData.abort) {
          try {
            if (responseData.originalCallback)
              responseData.originalCallback.bind(xhr)(...responseData.arguments);
            xhr.readyStateManaged = true;
          } catch (_err) {
            if (!xhr.readyStateManaged) throw _err;
          }
        }
      };
      requestData.handlers = xhr.blhandlers;
      blevent.http.before_request(requestData);
      if (!requestData.abort) origSend.call(xhr, body);
    };

    xhr.addEventListener('error', function () {
      let e: BLHTTPErrorEvent = {
        request: requestData,
        name: 'request-error',
        target: xhr,
        timestamp: new Date().getTime()
      };
      blevent.http.error(e);
    });
    xhr.addEventListener('abort', function () {
      let e: BLHTTPAbortEvent = {
        request: requestData,
        name: 'request-abort',
        target: xhr,
        timestamp: new Date().getTime()
      };
      blevent.http.abort(e);
    });

    xhr.addEventListener('load', function () {
      xhr.httpData.response.timestamp = new Date().getTime();
      const headers = {};
      xhr
        .getAllResponseHeaders()
        .trim()
        .split(/[\r\n]+/)
        .map((value) => value.split(/: /))
        .forEach((keyValue) => {
          try {
            headers[keyValue[0].trim()] = keyValue[1].trim();
          } catch (he) {}
        });
      xhr.httpData.response.headers = headers;
      xhr.httpData.response.status = xhr.status;
      xhr.httpData.response.target = xhr;
      xhr.httpData.response.request = requestData;
      xhr.httpData.response.name = 'after-response';
      if (xhr.responseType == '' || xhr.responseType == 'text') {
        xhr.httpData.response.body = xhr.responseText;
        blevent.http.after_response(xhr.httpData.response);
      } else if (xhr.responseType == 'blob') {
        let reader = new FileReader();
        reader.addEventListener('loadend', (e: any) => {
          const text = e.srcElement.result;
          xhr.httpData.response.body = text;
          blevent.http.after_response(xhr.httpData.response);
        });
        reader.readAsText(xhr.response);
      }
    });
    let originalEventListener = xhr.addEventListener;
    xhr.addEventListener = function (...args) {
      let event = args[0];
      let handler = args[1];
      let useCapture = args[2];
      let newHandler = (...hargs) => {
        const responseData: BLHTTPBeforeResponseEvent = {
          name: 'before-response',
          target: xhr,
          arguments: hargs,
          originalCallback: handler,
          abort: false,
          request: requestData,
          timestamp: new Date().getTime()
        };

        blevent.http.before_response(responseData);

        if (!responseData.abort) {
          handler.bind(xhr)(...hargs);
          if (event == 'readystatechange') xhr.readyStateManaged = true;
        }
      };
      xhr.blhandlers[event] = xhr.blhandlers[event] || [];
      xhr.blhandlers[event].push({ handler, useCapture });
      originalEventListener.bind(xhr)(event, newHandler, useCapture);
    };

    origOpen.apply(xhr, arguments as any);
  };
}
