import { BLEventName, BLSessionEvent } from '@notest/common';

export function findEventsByName<T>(events: BLSessionEvent[], name: BLEventName): T {
  return events.find((event) => event.name === name) as T;
}

export function findLastEventsByName<T>(events: BLSessionEvent[], name: BLEventName): T {
  const eventsFiltered = events.filter((event) => event.name === name) as T[];
  return eventsFiltered.pop();
}