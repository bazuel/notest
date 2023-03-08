import { BLMonitor, BLMouseEvent } from '@notest/common';
import { on } from '../utils/on.event';
import { throttle } from '@notest/common';
import { blevent } from '../model/dispatched.events';

export class MouseMonitor implements BLMonitor {
  private disableMonitoring: () => void = () => {};

  enable(): void {
    function mouseEventMapper(evt, processBoundingRect = true) {
      const { target, currentTarget } = evt;
      const isTouch = !!evt.changedTouches;
      const { clientX, clientY } = isTouch ? evt.changedTouches[0] : evt;

      let data: Partial<BLMouseEvent> = {
        x: clientX,
        y: clientY,
        target,
        currentTarget
      };
      if (processBoundingRect) {
        let rect = (target as HTMLElement).getBoundingClientRect();
        let relative = { x: clientX - rect.left, y: clientY - rect.top };
        data.relative = relative;
        if (evt.currentTarget && evt.currentTarget.getBoundingClientRect) {
          try {
            let rectCT = (currentTarget as HTMLElement).getBoundingClientRect();
            let relativeCT = { x: clientX - rectCT.left, y: clientY - rectCT.top };
            data.relativeCT = relativeCT;
            data.currentTarget = evt.currentTarget;
          } catch (e) {
            //ignore
          }
        }
      }
      return data;
    }

    const updatePosition = throttle((evt) => {
      let data = mouseEventMapper(evt, false);
      data.name = !!(evt as any).changedTouches ? 'touchmove' : 'mousemove';
      if (data.name == blevent.name('touchmove')) blevent.mouse.touchmove(data);
      else blevent.mouse.mousemove(data);
    }, 50);
    const handlers = [on('mousemove', updatePosition), on('touchmove', updatePosition)];
    let restoreOriginals = [...handlers];

    let events = blevent.list(
      'mouseup',
      'mousedown',
      'click',
      'contextmenu',
      'dblclick',
      'touchstart',
      'touchend'
    );
    for (let e of events) {
      restoreOriginals.push(
        on(e, (evt) => {
          let data = { ...mouseEventMapper(evt), name: e };
          blevent.mouse[e](data);
        })
      );
    }
    this.disableMonitoring = () => {
      restoreOriginals.forEach((restore) => {
        restore();
      });
    };
  }

  disable(): void {
    this.disableMonitoring();
  }
}
