import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bl-event-time',
  templateUrl: './event-time.component.html',
  styleUrls: ['./event-time.component.scss']
})
export class EventTimeComponent implements OnInit {
  @Input()
  timestamp!: number;

  constructor() {}

  ngOnInit(): void {}
}
