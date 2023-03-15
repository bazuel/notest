import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nt-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent {
  @Input()
  switched: boolean | undefined;
  @Output()
  switchedChange = new EventEmitter<boolean>();

  @HostListener('click')
  switch() {
    this.switched = !this.switched;
    this.switchedChange.emit(this.switched);
  }
}
