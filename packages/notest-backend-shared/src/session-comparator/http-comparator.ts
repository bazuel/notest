import { BLHTTPResponseEvent } from '@notest/common';

export class HttpComparator {
  compareList(currentHttpEvents: BLHTTPResponseEvent[], previousHttpEvents: BLHTTPResponseEvent[]) {
    for (const currentHttpEvent of currentHttpEvents) {
      const similarRequest = this.findSimilarRequest(previousHttpEvents, currentHttpEvent);
      this.compare(similarRequest, currentHttpEvent);
    }
  }

  private compare(similarRequest: BLHTTPResponseEvent, currentHttpEvent: BLHTTPResponseEvent) {
    if (similarRequest.status !== currentHttpEvent.status) {
      return false;
    }
    return true;
  }

  private findSimilarRequest(
    session: BLHTTPResponseEvent[],
    event: BLHTTPResponseEvent
  ): BLHTTPResponseEvent {
    const eventFounded = session.find((e) => {
      //check if url is the same
      const urlIsTheSame = new URL(e.request.url).pathname === new URL(event.request.url).pathname;
      if (!urlIsTheSame) return false;

      //get url params of query requests
      const urlParams = new URLSearchParams(event.request.url).keys();
      const urlParams2 = new URLSearchParams(e.request.url).keys();
      //check if url params are the same
      const urlParamsAreTheSame = Array.from(urlParams).every((param) => {
        return Array.from(urlParams2).includes(param);
      });
      return urlParamsAreTheSame;
    });
    return eventFounded ? JSON.parse(JSON.stringify(eventFounded)) : undefined;
  }
}
