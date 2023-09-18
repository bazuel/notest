import {
  BLCssRuleRemoveEvent,
  BLDomEvent,
  BLEvent,
  BLInputChangeEvent,
  BLInputCheckboxChangeEvent,
  BLMutationEventData,
  BLScrollEvent,
  debounce,
  DOMJson,
  DOMJsonElement,
  RequestAnimationFrameTimer
} from '@notest/common';
import { DomJsonMerger } from '../deserializer/dom.json-merger';
import { ToggleIframeAnimationsApi } from './toggle-iframe-animations.api';
import { LazyImagesRefresherApi } from '../deserializer/lazy-images-refresher.api';
import { CursorComponent, CursorDrawerComponent } from './cursor-drawer.component';
import { FocusHoverFakeClassAdderApi } from './focus-hover-fake-class-adder.api';
import { ElementDeserializer } from '../deserializer/element.deserializer';
import { MutationRenderer } from '../deserializer/mutation.renderer';
import { CssDeserializer } from '../deserializer/css.deserializer';

const dom = { full: 'dom-full', change: 'dom-change' };

export class PlayerComponent {
  private cursor: CursorComponent;
  private iframe!: HTMLIFrameElement;
  private deserializedMap!: Map<number, Node>;
  private deserializer!: ElementDeserializer;
  private target!: {
    doc: Document;
    iframe: HTMLIFrameElement;
    readonly win: Window;
  };
  private events!: BLEvent[];
  private container: HTMLDivElement;
  private playing = false;
  private currentTimestamp!: number;
  private timer: RequestAnimationFrameTimer;
  private lastIndex = 0;
  private root: HTMLDivElement;
  private cssDeserializer: CssDeserializer = new CssDeserializer();
  private speed = 1;

  constructor(
    container: HTMLDivElement,
    private options = {
      deserializerProxyBasePath: '',
      onTimestampChange: (timestamp: number, last?: boolean) => {},
      onIframeClick: () => {},
      onResize: (scale: number) => {}
    }
  ) {
    this.root = container;
    this.container = document.createElement('div');
    this.container.style.transformOrigin = 'top left';
    this.root.appendChild(this.container);
    this.container.style.position = 'relative';
    window.addEventListener('resize', () => {
      this.updatePlayerZoom();
    });
    this.cursor = CursorDrawerComponent.createCursor();
    this.timer = new RequestAnimationFrameTimer();
    this.timer.start((msFromLast) => {
      if (this.playing) {
        this.playFrameEvents(this.speed * msFromLast);
        const lastTs = this.events[this.events.length - 1].timestamp;
        const last = Math.abs(this.currentTimestamp - lastTs) < 100;
        options.onTimestampChange(this.currentTimestamp, last);
      }
    });
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  private applyForward = debounce(() => {
    this.pause();
    this.moveTo(this.currentTimestamp);
  }, 300);

  private applyFrameEvents(events: BLEvent[]) {
    let lastChecked = events
      .slice()
      .reverse()
      .find((e) => e.name == 'checked' || e.name == 'input') as BLInputCheckboxChangeEvent;
    let lastInput = events
      .slice()
      .reverse()
      .find((e) => e.name == 'value' || e.name == 'input') as BLInputChangeEvent;
    if (lastInput) {
      let el = this.deserializedMap.get(lastInput.target as unknown as number) as HTMLInputElement;
      if (el && el.getAttribute) {
        // text and comment elements do not have getAttribute
        if (el.getAttribute('type') == 'radio') {
          if (el.getAttribute('value') == lastInput.value) {
            let name = el.getAttribute('name');
            document
              .querySelectorAll(`input[type='radio'][name='${name}']`)
              .forEach((r) => ((r as HTMLInputElement).checked = false));
            el.checked = true;
          }
        } else el.value = lastInput.value.toString();
      }
    }
    if (lastChecked) {
      let el = this.deserializedMap.get(
        lastChecked.target as unknown as number
      ) as HTMLInputElement;
      if (el) {
        el.checked = !!lastChecked.checked;
      }
    }

    let scrolls = {};
    events
      .filter((e) => e.name == 'scroll' || e.name == 'elementscroll')
      .map((e) => e as BLScrollEvent)
      .forEach((e) => (scrolls[e.target as unknown as string] = e));
    const updateScrolling = () => {
      let scrolled = false;
      const scrollWindow = (e) => {
        scrolled = true;
        this.target.win!.scrollTo(e.x, e.y);
        new LazyImagesRefresherApi().refreshLazyImages(this.target.iframe);
      };
      for (let ek in scrolls) {
        let e = scrolls[ek];
        if (e.name == 'scroll') {
          scrollWindow(e);
        } else if (e.name == 'elementscroll') {
          let element = this.deserializedMap.get(e.target);
          if (element == this.target.doc) scrollWindow(e);
          else if (element) {
            (element as HTMLElement).scrollTo(e.x, e.y);
            scrolled = true;
          }
        }
      }
      return scrolled;
    };
    this.cursor.drawCursor(this.iframe, events, this.deserializedMap);
    if (!updateScrolling()) new LazyImagesRefresherApi().refreshLazyImages(this.target.iframe);
  }

  private applyMutations(events: BLEvent[]) {
    let mutations: BLMutationEventData[] = [];
    for (let e of events)
      if ((e as BLDomEvent).mutations) mutations.push(...(e as BLDomEvent).mutations!);
    for (let m of mutations)
      new MutationRenderer().render(m, this.deserializedMap, this.deserializer, this.target.doc!);
  }

  get start() {
    return this.events.find((s) => s.name == dom.full)!.timestamp;
  }

  moveTo(timestamp) {
    let fullDom = this.events.find((s) => s.name == dom.full) as BLDomEvent;
    if (!fullDom)
      throw new Error('Full DOM event not found. Did you set the session events? (.setEvents)');
    let events = this.events.filter((e) => e.timestamp <= timestamp);
    let mutationEvents = events.filter((s) => s.name == dom.change) as BLDomEvent[];
    let mutations: BLMutationEventData[] = [];
    for (let me of mutationEvents) mutations.push(...(me.mutations ?? []));
    let frame = new DomJsonMerger().merge(fullDom.full!, mutations);
    this.deserializedMap.clear();
    this.deserializer.deserialize(frame as DOMJsonElement, this.target.doc);
    this.pause();
    let otherEvents = events.filter((s) => s.name != dom.change && s.name != dom.full);
    this.currentTimestamp = timestamp;
    this.lastIndex = events.length - 1;
    new FocusHoverFakeClassAdderApi().addHoverRules(this.target.doc).then(() => {
      this.applyFrameEvents(otherEvents);
      new LazyImagesRefresherApi().refreshLazyImages(this.target.iframe, {
        skipVisibleAreaCheck: true
      });
    });
  }

  addEvents(events: BLEvent[]) {
    this.events.push(...events);
  }

  play() {
    new ToggleIframeAnimationsApi().playAnimations(this.target.iframe);
    this.playing = true;
  }

  pause() {
    new ToggleIframeAnimationsApi().pauseAnimations(this.target.iframe);
    this.playing = false;
  }

  forward(ms = 300) {
    let where = this.currentTimestamp + ms - this.start;
    console.log('where: ', where);
    this.currentTimestamp = this.currentTimestamp + ms;
    this.applyForward();
  }

  setEvents(events: BLEvent[], tag: string) {
    this.lastIndex = 0;
    this.events = events;
    let fullDom = events.find((s) => s.name == dom.full) as BLDomEvent;
    if (!fullDom) throw new Error('Full DOM event not found');
    this.filterElementForTag(tag, fullDom.full);
    this.reset(fullDom.full?.width!, fullDom.full?.height!);
    this.moveTo(fullDom.timestamp);
  }

  private playFrameEvents(msFromLast) {
    const from = this.currentTimestamp;
    const to = this.currentTimestamp + msFromLast;
    if (this.lastIndex < this.events.length - 1) {
      let events = this.events.filter((e, i) => {
        let consider = e.timestamp > from && e.timestamp <= to;
        if (consider) this.lastIndex = i;
        return consider;
      });
      if (events.length > 0) {
        this.applyMutations(events);
        this.applyFrameEvents(events);
        this.applyCssEvents(events);
        this.preventLinks();
      }
      if (events.length > 0) this.currentTimestamp = events[events.length - 1].timestamp;
      else if (this.lastIndex < this.events.length - 1) this.currentTimestamp += msFromLast;
      else this.currentTimestamp = this.events[this.events.length - 1].timestamp;
    }
  }

  private reset(width: number, height: number) {
    if (this.iframe?.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
    if (this.cursor?.parentNode) {
      this.cursor.parentNode.removeChild(this.cursor);
    }
    this.iframe = document.createElement('iframe');
    this.iframe.style.border = `1px solid #d9d9d9`;
    this.container.appendChild(this.iframe);
    this.container.appendChild(this.cursor);
    this.manageIframeClick(this.iframe);
    let target = this.initIframe(this.iframe, width, height);
    this.target = target;
    let deserializedMap = new Map<number, Node>();
    let eds = new ElementDeserializer(
      (n, j) => {
        if (!deserializedMap.has(j.id)) {
          deserializedMap.set(j.id, n);

          //;(n as HTMLElement).setAttribute && (n as HTMLElement).setAttribute("data_blid", j.id)
        }
      },
      { proxyBasePath: this.options.deserializerProxyBasePath }
    );
    this.deserializedMap = deserializedMap;
    //;(window as any).bl_deserializedMap = deserializedMap
    this.deserializer = eds;
  }

  private initIframe(iframe: HTMLIFrameElement, width: number, height: number) {
    let doc = iframe.contentDocument as Document;
    if (!iframe.getAttribute('data-bl-inited')) {
      iframe.width = width + 'px';
      iframe.height = height + 'px';

      if (doc?.head) {
        doc.head.innerHTML = '';
        doc.body.innerHTML = '';
      }
      iframe.classList.add('bl-iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin');
      iframe.setAttribute('data-bl-inited', 'done');
      //iframe.setAttribute('scrolling', 'no');
    }
    this.updatePlayerZoom();
    return {
      iframe,
      get doc() {
        return iframe.contentDocument!;
      },
      get win() {
        return iframe.contentWindow!;
      }
    };
  }

  updatePlayerZoom() {
    this.container.style.width = 'auto';
    this.container.style.height = 'auto';
    let box = this.root.getBoundingClientRect();
    let w = box.width + 16;
    let h = Math.min(box.height, window.innerHeight);
    let iw = parseInt(this.iframe.width);
    let ih = parseInt(this.iframe.height);
    let scaleW = w / iw;

    let scaleH = h / ih;
    let scale = Math.min(scaleW, scaleH);
    this.container.style.transform = `scale(${scale})`;
    let cbox = this.container.getBoundingClientRect();
    this.container.style.width = cbox.width + 'px';
    this.container.style.height = cbox.height + 'px';
    this.options.onResize(scale);
  }

  private applyCssEvents(events: BLEvent[]) {
    let cssEvents = events.filter(
      (e) => e.name == 'css-add' || e.name == 'css-remove'
    ) as BLCssRuleRemoveEvent[];
    cssEvents.sort((c1, c2) => c1.index - c2.index);
    for (let e of cssEvents) {
      try {
        let style = this.target.doc.querySelector(
          '#bl_style_' + (e as BLCssRuleRemoveEvent).target
        ) as HTMLStyleElement;
        if (!style) {
          let s = this.target.doc.createElement('style');
          s.id = '#bl_style_' + (e as BLCssRuleRemoveEvent).target;
          this.target.doc.head.appendChild(s);
          style = s;
        }
        this.cssDeserializer.deserialize(e, style);
      } catch (e) {
        console.log(e);
      }
    }
  }

  private manageIframeClick(iframe: HTMLIFrameElement) {
    window.addEventListener('blur', (e) => {
      window.setTimeout(() => {
        if (document.activeElement == iframe) {
          console.log('document.activeElement');
          window.focus();
          this.options.onIframeClick();
        }
      }, 10);
    });
  }

  private preventLinks() {
    this.target.doc.body.querySelectorAll('a:not(.bl_link_prevented)').forEach((a) => {
      a.classList.add('bl_link_prevented');
      a.addEventListener('click', (e) => e.preventDefault());
    });
  }

  private filterElementForTag(tag: string, root: DOMJson | undefined, parent?: DOMJson) {
    if (root?.tag == tag && parent) {
      parent.children = parent?.children?.filter((c) => c != root);
      return true;
    } else if (root?.children) {
      for (const child of root.children) {
        if (this.filterElementForTag(tag, child, root)) return true;
      }
    }
    return false;
  }
}
