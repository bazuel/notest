import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { copyToClipboard } from '@notest/common';

export function showCopiedTooltip(a) {
  if (!a.className) a.className = '';
  a.className += ' copied';
  setTimeout(() => {
    a.className = a.className.replace(/copied/g, '');
  }, 2500);
}

@Directive({
  selector: '[copy]'
})
export class CopyDirective {
  @Input()
  copy = '';

  constructor(private _elementRef: ElementRef) {}

  @HostListener('click')
  private onClick() {
    copyToClipboard(this.copy);
    let a = this._elementRef.nativeElement;
    showCopiedTooltip(a);
  }
}
