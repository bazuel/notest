import { BLHTTPResponseEvent } from '@notest/common';

export function compareStatusResponse(
  request1: BLHTTPResponseEvent,
  request2: BLHTTPResponseEvent
) {
  return request1.status === request2.status;
}
