import { DomFrameMutationsMonitor } from './dom-mutations.monitor';
import { MutationSerializer } from './serializer/mutation.serializer';
import { BLDomEvent, BLMonitor } from '@notest/common';
import { ElidGenerator } from './serializer/elid.generator';
import { ElementSerializer } from './serializer/element.serializer';
import { blevent } from '../model/dispatched.events';

export class DomMonitor implements BLMonitor {
  private mutationObserver!: DomFrameMutationsMonitor;
  private fullEventFireIntervalId;
  private elementsMap: Map<Node, number> = new Map<Node, number>();

  constructor(
    private options: { intervalTimeForFullEvent: number } = { intervalTimeForFullEvent: -1 }
  ) {}

  enable() {
    //(window as any).bl_serializedMap = this.elementsMap
    this.mutationObserver = new DomFrameMutationsMonitor((frameMutations) => {
      let mutations = new MutationSerializer(this.elementsMap, elid, serializer).serialize(
        frameMutations
      );
      let e: BLDomEvent = {
        mutations,
        timestamp: new Date().getTime(),
        type: 'dom',
        name: 'dom-change'
      };
      blevent.dom.change(e);
    });
    let elid = new ElidGenerator(this.elementsMap);
    let serializer = new ElementSerializer((n, j) => {
      let sr = (n as any).shadowRoot || (n as any)._closed_mode_shadowRoot;

      if (sr) {
        this.mutationObserver.observe(sr);
      }
      j.id = elid.id(n); // element is added to map by elid
      //;(n as any).setAttribute && (n as any).setAttribute("data_blid", j.id)
    });
    blevent.dom.map_created({ map: this.elementsMap, serializer });

    if (this.options.intervalTimeForFullEvent > 0)
      this.fullEventFireIntervalId = setInterval(() => {
        this.fireFullDomEvent(serializer);
      }, this.options.intervalTimeForFullEvent);

    this.fireFullDomEvent(serializer);
    this.mutationObserver.observe(document);
    let webComponents = [...(document.querySelectorAll('*') as any)].filter(
      (x) => x.tagName.indexOf('-') >= 0
    );
    const pageHasWebComponents = webComponents.length > 0;
    if (pageHasWebComponents) {
      for (let w of webComponents) {
        let sr = w.shadowRoot || w._closed_mode_shadowRoot;
        if (sr) this.mutationObserver.observe(sr);
      }
    }
  }

  disable() {
    this.mutationObserver.disable();
    if (this.fullEventFireIntervalId) clearInterval(this.fullEventFireIntervalId);
  }

  private fireFullDomEvent(serializer: ElementSerializer) {
    let snapshot = serializer.serialize(document);
    const fullEvent = { full: snapshot } as BLDomEvent;
    blevent.dom.full(fullEvent);
    return snapshot;
  }
  private takeDomSnapShot(serializer: ElementSerializer) {
    let style = document.getElementById('sidebar-right')!.style.display;
    document.getElementById('sidebar-right')!.style.display = 'none';
    let snapshot = serializer.serialize(document);
    const fullEvent = { full: snapshot } as BLDomEvent;
    blevent.dom.full(fullEvent);
    document.getElementById('sidebar-right')!.style.display = style;
    return snapshot;
  }

  takeDomScreenshot() {
    return this.takeDomSnapShot(new ElementSerializer());
  }
}
