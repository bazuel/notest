import { BLEvent, BLMouseEvent } from "@notest/common";

function blIcon(path: string) {
  return ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="sc-bl-icon">
              <path class="sc-bl-icon" d="${path}" />
            </svg>`;
}

function svg(content: string) {
  return ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" class="sc-bl-icon">
              ${content}
            </svg>`;
}

export type CursorComponent = HTMLDivElement & {
  drawCursor(
    iframe: HTMLIFrameElement,
    events: BLEvent[],
    deserialized: Map<number, Node>
  );
};

export class CursorDrawerComponent {
  private cursor!: HTMLElement;
  private cursorClick!: HTMLElement;
  private root!: HTMLDivElement;
  private lastMouseMoveTarget = { id: 0, width: 0, height: 0 };

  private constructor() {}

  static createCursor() {
    const c = new CursorDrawerComponent();
    let root = c.initCursor();
    (root as any).drawCursor = (
      iframe: HTMLIFrameElement,
      events: BLEvent[],
      deserialized: Map<number, Node>
    ) => {
      c.drawCursor.bind(c)(iframe, events, deserialized);
    };
    return root as CursorComponent;
  }

  initCursor() {
    let root = document.createElement("div");
    root.style.position = "absolute";
    root.style.top = "0";
    root.style.left = "0";
    root.style.pointerEvents = "none";

    let cursorSvg = document.createElement("div");
    cursorSvg.innerHTML = svg(
      `<circle cx="12" cy="12" r="10" style="fill: #56cdffad;"></circle>`
    );
    this.cursorClick = cursorSvg.querySelector("svg") as unknown as HTMLElement;
    this.cursorClick.classList.add("icon-cursor-click");
    root.appendChild(this.cursorClick);

    cursorSvg.innerHTML = blIcon(
      "M 0.82757583,0.12812015 16.478887,14.182722 9.4260635,14.487949 13.012006,21.907785 9.2929925,23.876393 5.9902923,16.113527 0.32773333,22.042425 Z"
    );
    this.cursor = cursorSvg.querySelector("svg") as unknown as HTMLElement;
    this.cursor.classList.add("icon-cursor");
    root.appendChild(this.cursor);

    let cursorStyle = document.createElement("style");
    let cursorRules = `fill: black; stroke: white;stroke-width: 1px;`;
    if (navigator.platform.toLowerCase().indexOf("win") >= 0)
      cursorRules = `fill: white; stroke: black;stroke-width: 1px;`;
    cursorStyle.innerHTML = `
            .icon-cursor {
                position: absolute;
            }
            .icon-cursor-click {
                position: absolute;
                display: none;
            }
            .icon-cursor path {${cursorRules}}
        `;
    root.appendChild(cursorStyle);
    this.root = root;
    return root;
  }

  drawCursor(
    iframe: HTMLIFrameElement,
    events: BLEvent[],
    deserialized: Map<number, Node>
  ) {
    if (!this.root) {
      this.root = this.initCursor();
    }
    this.root.style.width = iframe.width;
    this.root.style.height = iframe.height;
    const target = (e) => deserialized.get(e.target as number) as HTMLElement;
    let lastMouseMove: BLMouseEvent;
    let lastClickEvent: BLMouseEvent;
    let lastInput;
    for (let be of events) {
      if (be.name == "input" || be.name == "value") {
        lastInput = be;
      } else {
        let e = be as BLMouseEvent;
        if (e.name == "mousedown") {
          this.cursorClick.style.top = e.y - 10 + "px";
          this.cursorClick.style.left = e.x - 10 + "px";
          this.cursorClick.style.display = "block";
        } else if (e.name == "mouseup") {
          this.cursorClick.style.display = "none";
        } else if (e.name == "mousemove") {
          lastMouseMove = e;
          this.cursor.style.top = e.y + "px";
          this.cursor.style.left = e.x + "px";
          if (this.cursorClick.style.display == "block") {
            this.cursorClick.style.top = e.y - 10 + "px";
            this.cursorClick.style.left = e.x - 10 + "px";
          }
        } else if (e.name == "click") {
          lastClickEvent = e;
        }
      }
    }
    this.applyFakeClassesIfLastEventTargetChanged(
      lastInput,
      lastClickEvent!,
      lastMouseMove!,
      iframe,
      target
    );

    return this.root;
  }

  private applyFakeClassesIfLastEventTargetChanged(
    lastInput,
    lastClickEvent: BLMouseEvent,
    lastMouseMove: BLMouseEvent,
    iframe: HTMLIFrameElement,
    target: (e) => HTMLElement
  ) {
    if (lastInput || lastClickEvent || lastMouseMove) {
      if (lastInput || lastClickEvent) {
        this.cleanClasses(iframe, "focus-fake-class");
        if (lastInput) this.applyClass(target(lastInput), "focus-fake-class");
        if (lastClickEvent)
          this.applyClass(target(lastClickEvent), "focus-fake-class");
      }
      if (lastMouseMove) {
        //let ts =  iframe.contentDocument!.elementsFromPoint(lastMouseMove.x, lastMouseMove.y) as HTMLElement[] //target(lastMouseMove)
        //for(let t of ts)
        let t = target(lastMouseMove);
        if (t && t.getBoundingClientRect) {
          let box = t.getBoundingClientRect();
          let { width, height } = box;
          // at each css load the width may change and so the parents to who fake class have to be applied
          if (
            this.lastMouseMoveTarget.id != (lastMouseMove.target as any) ||
            this.lastMouseMoveTarget.width != width ||
            this.lastMouseMoveTarget.height != height
          ) {
            this.cleanClasses(iframe, "hover-fake-class");
            this.applyClass(t, "hover-fake-class");
            this.lastMouseMoveTarget = {
              id: lastMouseMove.target as any,
              width,
              height,
            };
          }
        }
      }
    }
  }

  private applyClass(
    target: HTMLElement,
    className: string,
    options = { parentWidthTolerance: 50 }
  ) {
    if (target && target.classList) {
      target.classList.add(className);
      let tr = target.getBoundingClientRect();
      let w = tr.width;
      let h = tr.height;
      let checkParent = true;
      let parent = target.parentElement;
      const applyClassToParent = () => {
        while (checkParent) {
          if (parent) {
            let pr = parent.getBoundingClientRect();
            if (
              pr.width <= w + options.parentWidthTolerance &&
              pr.height <= h + options.parentWidthTolerance
            ) {
              parent.classList.add(className);
              parent = parent.parentElement;
            } else {
              checkParent = false;
            }
          } else checkParent = false;
        }
      };
      applyClassToParent();
      // if element is inside a web component slot, the parent area may be hierarchically above the slot too
      if (target.assignedSlot) {
        checkParent = true;
        parent = target.assignedSlot;
        applyClassToParent();
      }
    }
  }

  private cleanClasses(iframe: HTMLIFrameElement, ...classes: string[]) {
    for (let c of classes)
      iframe.contentDocument?.querySelectorAll("." + c).forEach((el) => {
        el.classList.remove(c);
      });

    // clean classes on web components too (they have their own scope)
    let webComponents = [
      ...(iframe.contentDocument?.querySelectorAll("*") as any),
    ].filter((x) => x.tagName.indexOf("-") >= 0);
    const pageHasWebComponents = webComponents.length > 0;
    if (pageHasWebComponents) {
      for (let w of webComponents) {
        let sr = w.shadowRoot || w._closed_mode_shadowRoot;
        if (sr) {
          for (let c of classes)
            sr.querySelectorAll("." + c).forEach((el) => {
              el.classList.remove(c);
            });
        }
      }
    }
  }
}
