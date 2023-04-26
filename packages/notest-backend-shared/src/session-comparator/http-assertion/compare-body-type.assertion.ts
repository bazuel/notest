import { BLHTTPResponseEvent } from '@notest/common';

export function compareBodyType(event1: BLHTTPResponseEvent, event2: BLHTTPResponseEvent) {
  const contentType1 = event1.response.headers['content-type'];
  const contentType2 = event2.response.headers['Content-type'];
  if (contentType1.localeCompare(contentType2) !== 0) {
    console.log('headerType Error', contentType1, contentType2);
    return false;
  }
  const event1BodyType = getBodyType(contentType1, event1);
  const event2BodyType = getBodyType(contentType2, event2);
  if (event1BodyType !== event2BodyType) {
    console.log('BodyType Error', event1BodyType, event2BodyType);
  }
  return event1BodyType === event2BodyType;
}

function getBodyType(contentType: string, event: BLHTTPResponseEvent) {
  try {
    JSON.parse(event.response.body as string);
    return 'json';
  } catch (e) {
    if (typeof event.response.body === 'string') return 'string';
    if (event.response.body instanceof Blob) return 'blob';
    return 'other';
  }
}
