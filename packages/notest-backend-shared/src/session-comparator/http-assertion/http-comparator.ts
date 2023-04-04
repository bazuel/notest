import { BLHTTPResponseEvent } from '@notest/common';

export abstract class HttpComparator {
  abstract compareList(
    currentHttpEvents: BLHTTPResponseEvent[],
    previousHttpEvents: BLHTTPResponseEvent[]
  ): {
    eventsError: { originalEvent: BLHTTPResponseEvent; newEvent: BLHTTPResponseEvent }[];
    notFoundedEvents: BLHTTPResponseEvent[];
  };
}
