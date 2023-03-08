import { BLEvent, BLMouseEvent, BLMoveEvent, BLSessionReference } from '@notest/common';
import { blevent } from '../model/dispatched.events';
import { ElementSelectorFinder } from './selector-finder.util';

const selector = (e) => new ElementSelectorFinder().findUniqueSelector(e);
export function combineMoveEvents(events: BLEvent[]) {
  let moves = blevent.list('mousemove', 'touchmove');
  let nonMoveEvents = events.filter((e) => moves.indexOf(e.name) < 0);
  let moveEvents = events.filter((e) => moves.indexOf(e.name) >= 0);

  let moveEventsTargetMap = new Map<string, { events: BLMouseEvent[] }>();
  for (let e of moveEvents) {
    let me = e as BLMouseEvent;
    let target = selector(me.target);
    if (!moveEventsTargetMap.has(target)) moveEventsTargetMap.set(target, { events: [] });
    moveEventsTargetMap.get(target)!.events.push(me);
  }

  let newMoveEvents: (BLMoveEvent & BLSessionReference)[] = [];
  moveEventsTargetMap.forEach((data, t) => {
    let first = data.events[0];
    let ble = first as unknown as BLSessionReference;
    let prev = first;
    let moves: BLMoveEvent['moves'] = data.events.slice(1).map((e) => {
      let ev = {
        x: e.x - prev.x,
        y: e.y - prev.y,
        at: e.timestamp - prev.timestamp
      };
      prev = e;
      return ev;
    });
    newMoveEvents.push({
      url: ble.url,
      sid: ble.sid,
      tab: ble.tab,
      target: first.target,
      name: first.name,
      timestamp: first.timestamp,
      type: first.type,
      moves,
      x: first.x,
      y: first.y
    });
  });

  let newEvents: BLEvent[] = [...nonMoveEvents, ...newMoveEvents];

  return newEvents;
}

export function restoreMoveEvent(event: BLMoveEvent): BLMouseEvent[] {
  let events: BLMouseEvent[] = [];
  let ti = event as unknown as BLSessionReference;
  let first = {
    url: ti.url,
    sid: ti.sid,
    tab: ti.tab,
    name: event.name as any,
    type: event.type,
    timestamp: event.timestamp,
    target: event.target,
    x: event.x,
    y: event.y
  };
  let prev = first;
  events.push(first);
  for (let e of event.moves) {
    let next = {
      url: ti.url,
      sid: ti.sid,
      tab: ti.tab,
      name: event.name as any,
      type: event.type,
      timestamp: prev.timestamp + e.at,
      target: event.target,
      x: prev.x + e.x,
      y: prev.y + e.y
    };
    events.push(next);
    prev = next;
  }
  return events;
}
