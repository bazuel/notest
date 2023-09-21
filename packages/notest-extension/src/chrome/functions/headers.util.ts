import {
  BLHTTPResponseEvent,
  BLSocketEvent,
  BLSocketOpenEvent,
  jsonFromNameValueArray,
  uppercaseKeys
} from '@notest/common';

let requestBucket: any[] = [];
let socketRequestHeadersBucket: chrome.webRequest.WebRequestHeadersDetails[] = [];
let socketResponseOpenHeadersBucket: chrome.webRequest.WebResponseHeadersDetails[] = [];

export function mergeEventReq(events: BLHTTPResponseEvent[]) {
  requestBucket.forEach((req) => {
    const eventsFiltered = events.filter((e) => {
      return (
        e.name == 'after-response' &&
        (e as BLHTTPResponseEvent).request.url == req.url &&
        !e['merged']
      );
    });
    const nearest: BLHTTPResponseEvent = eventsFiltered.reduce((currentNearest, e) => {
      if (e.timestamp - req.timeStamp < currentNearest.timestamp - req.timeStamp) return e;
      else return currentNearest;
    }, eventsFiltered[0]) as BLHTTPResponseEvent;

    if (nearest) {
      nearest['merged'] = true;
      nearest.request.headers = { ...nearest.request.headers, ...req.requestHeaders };
      nearest.response.headers = { ...nearest.response.headers, ...req.responseHeaders };
      uppercaseKeys(nearest.request.headers);
      uppercaseKeys(nearest.response.headers);
      requestBucket = requestBucket.filter((r) => r.requestId != req.requestId);
    }
  });
  requestBucket = [];
}

function mergeResReq(res) {
  let req = requestBucket.find((req) => req.requestId === res.requestId);
  if (req) {
    req.requestHeaders = jsonFromNameValueArray(req.requestHeaders);
    req.responseHeaders = jsonFromNameValueArray(res.responseHeaders);
  }
}

export function populateSocketSendHeaders(events: BLSocketOpenEvent[]) {
  events.forEach((e) => {
    if (e.name === 'open') {
      const socketOpenHeaders = socketRequestHeadersBucket.find((req) => req.url === e.value.url);
      socketRequestHeadersBucket = socketRequestHeadersBucket.filter(
        (req) => req !== socketOpenHeaders
      );
      const socketResponseOpenHeaders = socketResponseOpenHeadersBucket.find(
        (req) => req.url === e.value.url
      );
      socketResponseOpenHeadersBucket = socketResponseOpenHeadersBucket.filter(
        (req) => req !== socketResponseOpenHeaders
      );
      e.value.requestHeaders = jsonFromNameValueArray(socketOpenHeaders!.requestHeaders as any[]);
      e.value.responseHeaders = jsonFromNameValueArray(
        socketResponseOpenHeaders!.responseHeaders as any[]
      );
    }
  });
}

export function populateSocketMessageHeaders(events: BLSocketEvent[]) {}

export function enableHeadersListeners() {
  chrome.webRequest.onSendHeaders.addListener(
    (req) => {
      if (
        req.type === 'xmlhttprequest' &&
        ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'].includes(req.method)
      ) {
        requestBucket.push(req);
      }
      if (req.type === 'websocket') socketRequestHeadersBucket.push(req);
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (res) => {
      if (res.type === 'xmlhttprequest') mergeResReq(res);

      if (res.type === 'websocket') socketResponseOpenHeadersBucket.push(res);
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders', 'extraHeaders']
  );
}
