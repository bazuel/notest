import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({ selector: '[capsLock]' })
export class CapsLockDirective {
  @Output('capsLock') capsLock = new EventEmitter<boolean>();
  capsOn = false;

  constructor() {}

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.getModifierState) {
      this.capsOn = event.getModifierState('CapsLock');
      this.capsLock.emit(this.capsOn);
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
