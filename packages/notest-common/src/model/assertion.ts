import { Json } from "./json.type";
import { BLHTTPResponseEvent } from "./http.event";

export interface NTAssertion {
  original_reference: string;
  new_reference: string;
  type: NTAssertionType;
  name?: NTAssertionName;
  payload: Json;
}

export interface NTHttpAssertion extends NTAssertion {
  payload: { errorEvents: NTAssertionComparison<BLHTTPResponseEvent>[] };
}

export interface NTVisualAssertion extends NTAssertion {
  payload: { mismatchedPixel: number[] };
}

/**
 * Missed Event is populated by the original Events not founded in the new Events List
 */
export interface NTMissedEventsAssertion extends NTAssertion {
  payload: { missedEvents: BLHTTPResponseEvent[] };
}

export interface NTRunFinishedAssertion extends NTAssertion {
  payload: { testSuccessfullyFinished: boolean };
}
export type NTAssertionName = "status" | "contentType" | "bodyRequest";
export type NTAssertionType =
  | "http"
  | "visual"
  | "runSuccessfullyFinished"
  | "missedEvents";

export type NTAssertionComparison<T> = {
  originalEvent: T;
  newEvent: T;
};
