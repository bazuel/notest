import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { AssetLoader } from '../../../../shared/services/asset-loader';
import { BLEvent, BLSessionEvent } from '@notest/common';

export const devtoolsPanelsData = {
  // Session: {},
  Network: {},
  LocalStorage: {},
  SessionStorage: {},
  Cookies: {},
  // Device: {}
  Sockets: {}
};

export type DevtoolPanel = keyof typeof devtoolsPanelsData;

export const devtoolsPanels: DevtoolPanel[] = Object.keys(devtoolsPanelsData) as DevtoolPanel[];

@Component({
  selector: 'nt-session-devtool',
  templateUrl: './session-devtool.component.html',
  styleUrls: ['./session-devtool.component.scss']
})
export class SessionDevtoolComponent implements OnInit, OnChanges {
  panels: DevtoolPanel[] = [];

  @Input() events: BLSessionEvent[] = [];

  @Output()
  timestampChange = new EventEmitter<number>();

  @Input() collapsed = false;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.active = undefined as any;
      setTimeout(() => (this.active = 'Network'));
    }
  }
}
