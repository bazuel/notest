import { Component, EventEmitter, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nt-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent implements OnInit, OnChanges {
  @Output() click = new EventEmitter<any>();

  hasClickLister = false;

  constructor() {}

  ngOnInit() {
    this.hasClickLister = this.click.observers.length > 0;
  }
  ngOnChanges() {
    this.hasClickLister = this.click.observers.length > 0;
  }
}
