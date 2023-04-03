import { FindSimilarRequestAssertion } from './find-similar-request.assertion';
import { BLHTTPResponseEvent } from '@notest/common';

export class CompareBodyTypeAssertion extends FindSimilarRequestAssertion {
  compare(event1: BLHTTPResponseEvent, event2: BLHTTPResponseEvent) {
    const responseHeaderContentTypeEvent1 = event1.response.headers['content-type'];
    const responseHeaderContentTypeEvent2 = event2.response.headers['Content-type'];
    if (responseHeaderContentTypeEvent1.localeCompare(responseHeaderContentTypeEvent2) !== 0) {
      //content type of request described in header are different
      console.log(
        'headerType Error',
        responseHeaderContentTypeEvent1,
        responseHeaderContentTypeEvent2
      );
      return false;
    }
    const event1BodyType = this.getType(responseHeaderContentTypeEvent1, event1);
    const event2BodyType = this.getType(responseHeaderContentTypeEvent2, event2);
    if (event1BodyType !== event2BodyType) {
      console.log('BodyType Error', event1BodyType, event2BodyType);
    }
    return event1BodyType == event2BodyType;
  }

  private getType(contentType: string, event: BLHTTPResponseEvent) {
    if (contentType.includes('json') && typeof event.response.body === 'string') {
      try {
        JSON.parse(event.response.body);
        return 'json';
      } catch (e) {
        if ((event.response.body as any) instanceof Blob) {
          return 'blob';
        }
        return 'string';
      }
    } else {
      return contentType;
    }
  }
}
