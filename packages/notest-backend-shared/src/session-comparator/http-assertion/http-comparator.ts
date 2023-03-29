import { BLHTTPResponseEvent } from '@notest/common';

export abstract class HttpComparator {
  abstract compareList(
    currentHttpEvents: BLHTTPResponseEvent[],
    previousHttpEvents: BLHTTPResponseEvent[]
  );
}
