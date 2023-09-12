import {
  BLEvent,
  BLEventName,
  BLEventType,
  BLSessionEvent,
  BLSessionReference,
} from "../model/events";
import { domainFromUrl } from "./domain-from-url.util";

export function eventPath(event: BLSessionEvent) {
  return `${domainFromUrl(event.url)}/${eventReference(event)}`;
}
export function eventReference(
  event: BLSessionEvent,
  optionalTimestamp?: number
) {
  const parts = [
    optionalTimestamp ?? event.timestamp,
    event.type,
    event.name,
    event.sid ?? 0,
    event.tab ?? 0,
    encodeURIComponent(event.url),
  ];
  return parts.join("_");
}

export function eventInfoFromReference(
  reference: string
): BLSessionReference & BLEvent {
  const parts = reference.split("_");
  const timestamp = +parts[0];
  const type = parts[1] as BLEventType;
  const name = parts[2] as BLEventName;
  const sid = +parts[3];
  const tab = +parts[4];
  const url = decodeURIComponent(parts.slice(5).join("_"));
  return { name, type, sid, tab, timestamp, url };
}

export function pathSessionFromReference(reference: string) {
  return pathFromReference(reference, "session", "zip");
}

export function pathScreenshotFromReference(reference: string, name: string) {
  return pathFromReference(reference, name, "png");
}

export function pathVideoRecordFromReference(reference: string, name: string) {
  return pathFromReference(reference, name, "webm");
}

function pathFromReference(reference: string, name: string, ext: string) {
  const { timestamp, url } = eventInfoFromReference(reference);
  const d = new Date();
  d.setTime(timestamp);
  const date = d.toISOString().slice(0, 10);
  return `${domainFromUrl(url)}/${date}/${reference}/${name}.${ext}`;
}
