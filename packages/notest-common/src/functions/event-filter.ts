import { BLHTTPResponseEvent, BLSessionEvent } from "../model/events";

export const afterResponseFilter = (
  event: BLSessionEvent
): event is BLHTTPResponseEvent => event.name === "after-response";

export const domFullFilter = (event: BLSessionEvent) =>
  event.name === "dom-full";
