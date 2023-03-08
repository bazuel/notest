import { BLHTTPResponseEvent, jsonFromNameValueArray, uppercaseKeys } from '@notest/common';

let requestBucket: any[] = [];

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

export function enableHeadersListeners() {
  chrome.webRequest.onSendHeaders.addListener(
    (req) => {
      if (
        req.type === 'xmlhttprequest' &&
        ['POST', 'PUT', 'PATCH', 'GET', 'DELETE'].includes(req.method)
      ) {
        requestBucket.push(req);
      }
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'extraHeaders']
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (res) => {
      if (res.type === 'xmlhttprequest') {
        mergeResReq(res);
      }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders', 'extraHeaders']
  );
}

function mergeResReq(res) {
  let req = requestBucket.find((req) => req.requestId === res.requestId);
  if (req) {
    req.requestHeaders = jsonFromNameValueArray(req.requestHeaders);
    req.responseHeaders = jsonFromNameValueArray(res.responseHeaders);
  }
}
