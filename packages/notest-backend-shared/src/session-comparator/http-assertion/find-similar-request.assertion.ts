import { HttpComparator } from './http-comparator';
import { BLHTTPResponseEvent } from '@notest/common';

export abstract class FindSimilarRequestAssertion extends HttpComparator {
  compareList(eventList1: BLHTTPResponseEvent[], eventList2: BLHTTPResponseEvent[]) {
    let requestMap: { [k: string]: BLHTTPResponseEvent[] } = {};
    for (const event of eventList2) {
      let key = `${event.request.method}.${event.request.url}`;
      if (!requestMap[key]) requestMap[key] = [];
      requestMap[key].push(event);
    }
    let eventsError: { originalEvent: BLHTTPResponseEvent; newEvent: BLHTTPResponseEvent }[] = [];
    let notFoundedEvents: BLHTTPResponseEvent[] = [];
    for (const currentHttpEvent of eventList1) {
      let key = `${currentHttpEvent.request.method}.${currentHttpEvent.request.url}`;
      const similarRequest = requestMap[key]?.shift();
      if (!similarRequest) notFoundedEvents.push(currentHttpEvent);
      else if (!this.compare(similarRequest, currentHttpEvent)) {
        eventsError.push({ originalEvent: currentHttpEvent, newEvent: similarRequest });
      }
    }
    return { eventsError, notFoundedEvents };
  }

  abstract compare(event1: BLHTTPResponseEvent, event2: BLHTTPResponseEvent);
}
