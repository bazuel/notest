import { Json } from "./json.type";
import { BLHTTPResponseEvent } from "./http.event";
import { BLSessionEvent } from "./events";

export interface NTAssertion {
  original_reference: string;
  new_reference: string;
  type: NTAssertionType;
  name?: NTAssertionName;
  battery_id?: string;
  run_timestamp?: number;
  payload: Json;
}

export interface NTComparisonAssertion<E extends BLSessionEvent>
  extends NTAssertion {
  payload: { errorEvents: NTAssertionComparison<E>[] };
}

export interface NTHttpAssertion
  extends NTComparisonAssertion<BLHTTPResponseEvent> {
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

export type NTComparatorStrategy<T> = (l1: T, l2: T) => boolean;
