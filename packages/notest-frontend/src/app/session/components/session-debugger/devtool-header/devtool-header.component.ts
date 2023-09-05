import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DevtoolPanel, devtoolsPanels } from '../session-devtool/session-devtool.component';

@Component({
  selector: 'nt-devtool-header',
  templateUrl: './devtool-header.component.html',
  styleUrls: ['./devtool-header.component.scss']
})
export class DevtoolHeaderComponent implements OnInit {
  active!: DevtoolPanel;

  @Input()
  panels = [...devtoolsPanels];

  @Output()
  panelChange = new EventEmitter<DevtoolPanel>();

  constructor() {}

  ngOnInit(): void {
    this.active = this.panels[0];
  }
}
