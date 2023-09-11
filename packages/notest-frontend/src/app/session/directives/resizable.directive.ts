import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Input } from '@angular/core';
import { enableDrag } from './draggable.behaviour';

@Directive({
  selector: '[resize]'
})
export class ResizableDirective {
  @Input()
  resize = 'th';

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    @Inject(ElementRef)
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit() {
    const ne = this.elementRef.nativeElement;
    let t: HTMLElement = ne as HTMLElement;
    if (this.resize == 'parent') t = ne.parentElement!;
    let initial: any = null;

    // @ts-ignore
    const onMove = (
      start: { x: number; y: number },
      current: {
        x: number;
        y: number;
      },
      moving: boolean,
      e?: MouseEvent,
      startAbsolute?: { x: number; y: number },
      currentAbsolute?: {
        x: number;
        y: number;
      }
    ) => {
      if (!initial) {
        initial = t.getBoundingClientRect().width;
        document.body.classList.add('dragging-bl-tools');
      }
      if (moving) {
        let resizeEvent = new Event('bl-devtool-resize');
        document.dispatchEvent(resizeEvent);
        let newWidth = initial + (current.x - start.x);
        if (newWidth < 5) newWidth = 5;

        t.style.width = newWidth + 'px';
      }
      if (!moving) {
        document.body.classList.remove('dragging-bl-tools');
        initial = null;
      }
    };

    enableDrag(ne, onMove);
  }
}
