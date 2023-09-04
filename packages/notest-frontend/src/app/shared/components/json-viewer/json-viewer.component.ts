import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { JsonAction, JsonActionData, JsonViewerService } from './json-viewer.service';

type Json = any;
export interface RenderedJsonRow {
  rendered: RenderedJsonRow[];
  jsonType:
    | string
    | 'undefined'
    | 'object'
    | 'boolean'
    | 'number'
    | 'string'
    | 'function'
    | 'symbol'
    | 'bigint';
  expanded: boolean;
  key: string;
  value: string;
  tooltip: string | null;
  json: Json;

  toggle(e: MouseEvent);
}

@Component({
  selector: 'bl-json-viewer',
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss']
})
export class JsonViewerComponent implements OnInit, OnChanges {
  @Input()
  json: Json | any;

  @Input()
  wholeJson: Json | any;

  @Input()
  isMaster = true;

  @Output()
  renderedUpdated = new EventEmitter<RenderedJsonRow[]>();

  rendered: RenderedJsonRow[] = [];

  actions: JsonAction[] = [];

  constructor(private jsonViewerService: JsonViewerService) {
    this.actions = jsonViewerService.actions;
  }

  ngOnInit(): void {
    if (!this.wholeJson) this.wholeJson = this.json;
    this.rendered = this.toRenderedValues(this.json);
    this.renderedUpdated.emit(this.rendered);
  }

  ngOnChanges(): void {
    this.rendered = this.toRenderedValues(this.json);
    this.renderedUpdated.emit(this.rendered);
  }

  toRenderedValues(json: Json) {
    let keys = Object.keys(json as any);
    let keyRows = keys.map((k, i) => {
      let jsonValue = this.value(this.json[k]);
      let jsonType = this.jsonType(jsonValue);
      let r: RenderedJsonRow = {
        rendered: [],
        key: k,
        json: jsonValue,
        tooltip: this.renderTooltip(jsonValue),
        value: this.renderValue(jsonValue),
        expanded: false,
        toggle(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
          let isObject = jsonType == 'object';
          let isArray = jsonType == 'array';
          if (isObject || isArray) {
            r.expanded = !r.expanded;
          }
          return false;
        },
        jsonType
      };
      return r;
    });
    return keyRows;
  }

  private renderValue(json: Json) {
    if (this.isPrimitive(json)) return json as any;
    else {
      let prefix = '';
      if (Array.isArray(json)) prefix = `Array(${json.length}) `;
      return prefix + JSON.stringify(json);
    }
  }

  private renderTooltip(json: Json) {
    if (this.isPrimitive(json)) return null;
    else {
      return JSON.stringify(json);
    }
  }

  private jsonType(obj) {
    return obj === null ? 'null' : Array.isArray(obj) ? 'array' : typeof obj;
  }

  private isPrimitive(obj) {
    return obj !== Object(obj);
  }

  private value(value: any) {
    if (!value) return value;
    let json;
    if (value.constructor === [].constructor || value.constructor === {}.constructor) {
      return value;
    }

    try {
      json = JSON.parse(atob(value.split('.')[1]));
    } catch (e) {}
    if (!json) {
      try {
        json = JSON.parse(value);
      } catch (e) {}
    }
    if (!json) {
      try {
        json = JSON.parse(atob(value));
      } catch (e) {}
    }
    if (!json) {
      try {
        const j = {};
        const searchParams = new URLSearchParams(value);
        searchParams.forEach((v, k) => {
          if (v) j[k] = v;
        });
        if (Object.keys(j).length > 0) json = j;
      } catch (e) {}
    }
    return json || value;
  }

  handleAction(a: JsonAction, data: JsonActionData) {
    a.handler && a.handler(data);
    data.event.stopPropagation();
  }
}
