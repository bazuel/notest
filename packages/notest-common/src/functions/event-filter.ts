import {
  BLHTTPResponseEvent,
  BLSessionEvent,
  BLSocketEvent,
  BLSocketMessageEvent,
  BLSocketOpenEvent,
  BLSocketSendEvent,
} from "../model/events";

export const afterResponseFilter = (
  event: BLSessionEvent
): event is BLHTTPResponseEvent => event.name === "after-response";

export const domFullFilter = (event: BLSessionEvent) =>
  event.name === "dom-full";

export const isSocketResponse = (
  event: BLSessionEvent
): event is BLSocketMessageEvent =>
  event.name === "message" && event.type === "socket";

export const isSocketSend = (
  event: BLSessionEvent
): event is BLSocketSendEvent => event.name === "send";

export const isSocketOpen = (
  event: BLSessionEvent
): event is BLSocketOpenEvent => event.name === "open";

export const isSocket = (event: BLSessionEvent): event is BLSocketEvent =>
  event.name === "open" ||
  event.name === "close" ||
  event.name === "message" ||
  event.name === "error" ||
  event.name === "send";
