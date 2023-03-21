import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'nt-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  showCloseButton = true;

  @Input()
  closeClickOutside = true;

  @Output()
  close = new EventEmitter();

  constructor() {}

  ngOnInit() {
    this.showCloseButton = this.close.observed;
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key == 'Escape') this.close.emit();
  }
}
