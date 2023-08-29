import {
  NTAssertion,
  NTHttpAssertion,
  NTMissedEventsAssertion,
  NTRunFinishedAssertion,
  NTVisualAssertion,
} from "../model/assertion";

export function isRunSuccessfullyFinishedType(
  assertion: NTAssertion
): assertion is NTRunFinishedAssertion {
  return assertion.type === "runSuccessfullyFinished";
}
export function isMissedEventsType(
  assertion: NTAssertion
): assertion is NTMissedEventsAssertion {
  return assertion.type === "missedEvents";
}
export function isHttpStatusType(
  assertion: NTAssertion
): assertion is NTHttpAssertion {
  return assertion.type === "http" && assertion.name === "status";
}
export function isHttpBodyRequestType(
  assertion: NTAssertion
): assertion is NTHttpAssertion {
  return assertion.type === "http" && assertion.name === "bodyRequest";
}
export function isHttpContentType(
  assertion: NTAssertion
): assertion is NTHttpAssertion {
  return assertion.type === "http" && assertion.name === "contentType";
}
export function isVisualType(
  assertion: NTAssertion
): assertion is NTVisualAssertion {
  return assertion.type === "visual";
}
export function isHttp(assertion: NTAssertion): assertion is NTHttpAssertion {
  return assertion.type === "http";
}
