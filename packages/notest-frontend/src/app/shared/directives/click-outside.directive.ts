import {
  Directive,
  ElementRef,
  Output,
  HostListener,
  EventEmitter,
  Input,
} from '@angular/core';

@Directive({
  selector: '[clickOutside]',
})
export class ClickOutsideDirective {
  constructor(private _elementRef: ElementRef) {}

  @Input()
  toggleElement?: HTMLElement;

  @Output()
  clickOutside = new EventEmitter<MouseEvent>();

  @HostListener('document:mousedown', ['$event', '$event.target'])
  public onClick(event: MouseEvent, targetElement: HTMLElement): void {
    if (!targetElement) {
      return;
    }

    const clickedInside =
      this._elementRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      if (
        this.toggleElement &&
        targetElement !== this.toggleElement &&
        !this.toggleElement.contains(targetElement)
      ) {
        this.clickOutside.emit(event);
      } else if (!this.toggleElement) {
        this.clickOutside.emit(event);
      }
    }
  }
}
