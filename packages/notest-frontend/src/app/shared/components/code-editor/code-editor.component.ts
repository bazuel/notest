import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';

type Json = any;

import * as CM from 'codemirror';

@Component({
  selector: 'bl-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('textarea', { static: true })
  private textarea!: ElementRef<HTMLTextAreaElement>;
  private editor: any;

  @Input()
  code: string | Json;

  @Input()
  context: Json;

  @Output()
  save = new EventEmitter<string>();
  @Input()
  actions: ('save' | 'run')[] = [];
  @Input()
  mode: 'javascript' | 'json' | 'html' | 'xml' = 'javascript';

  ngOnInit() {
    if (typeof this.code != 'string') this.code = JSON.stringify(this.code, null, '  ');
  }

  ngAfterViewInit() {
    const mode = this.mode == 'json' ? 'application/ld+json' : 'javascript';
    console.log('cm');
    // this.editor = Codemirror.fromTextArea(this.textarea.nativeElement, {
    //   lineNumbers: true,
    //   matchBrackets: true,
    //   autoCloseBrackets: true,
    //   lineWrapping: true,
    //   mode
    // });

    this.editor.setSize(window.innerWidth * 0.6, window.innerHeight * 0.6);
    console.log('editor: ', this.editor);
  }

  emitSaveEvent() {
    this.save.emit(this.editor.getValue());
  }

  run() {
    this.code = this.editor.getValue();
    new Function('json', this.code as string)(this.context);
  }
}
