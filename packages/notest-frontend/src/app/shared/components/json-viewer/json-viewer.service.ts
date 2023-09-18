import { Injectable } from '@angular/core';
import { BOIcon } from '../icon/icon.component';
import { RenderedJsonRow } from './json-viewer.component';

type Json = any;

export type JsonActionData = {
  json: Json;
  event: MouseEvent;
  key?: string;
  rows: RenderedJsonRow[];
  wholeJson: Json;
};
export type JsonAction = {
  icon: BOIcon;
  tooltip: string;
  handler?: (data: JsonActionData) => void;
  link?: string;
};

@Injectable({ providedIn: 'root' })
export class JsonViewerService {
  actions: JsonAction[] = [];

  updateActions(actions) {
    this.actions = actions;
  }
}
