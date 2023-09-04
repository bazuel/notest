import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AssetLoader } from '../../../../shared/services/asset-loader';
import { BLEvent, BLSessionEvent } from '@notest/common';

export const devtoolsPanelsData = {
  // Session: {},
  Network: {},
  LocalStorage: {},
  SessionStorage: {},
  Cookies: {}
  // Device: {}
};

export type DevtoolPanel = keyof typeof devtoolsPanelsData;

export const devtoolsPanels: DevtoolPanel[] = Object.keys(devtoolsPanelsData) as DevtoolPanel[];

@Component({
  selector: 'bl-session-devtool',
  templateUrl: './session-devtool.component.html',
  styleUrls: ['./session-devtool.component.scss']
})
export class SessionDevtoolComponent implements OnInit {
  panels: DevtoolPanel[] = [];

  @Input() events: BLSessionEvent[] = [];

  @Output()
  timestampChange = new EventEmitter<number>();

  @Output()
  noteClicked = new EventEmitter<number>();
  active: DevtoolPanel = 'Network';

  constructor(private assets: AssetLoader) {}

  ngOnInit() {
    this.panels = [...devtoolsPanels];

    // setTimeout(async () => {
    //   await this.assets.loadScript('assets/libs/codemirror.min.js');
    //   await this.assets.loadScript('assets/libs/codemirror.javascript.min.js');
    //   await this.assets.loadStyle('assets/libs/codemirror.min.css');
    // }, 1000);
  }
}
