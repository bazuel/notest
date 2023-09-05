import { Component, Input, OnInit } from '@angular/core';
import { JsonActionData } from '../json-viewer/json-viewer.service';

@Component({
  selector: 'bl-json-template',
  templateUrl: './json-template.component.html',
  styleUrls: ['./json-template.component.scss']
})
export class JsonTemplateComponent implements OnInit {
  @Input()
  data!: JsonActionData;

  constructor() {}

  ngOnInit() {
    console.log(this.data);
  }
}
