import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Compartment, EditorState } from '@codemirror/state';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { indentUnit } from '@codemirror/language';

type Json = any;

@Component({
  selector: 'bl-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, OnChanges {
  @ViewChild('textarea', { static: true }) private textarea!: ElementRef<HTMLTextAreaElement>;

  private editor!: EditorView;

  code: string | Json;

  @Input()
  context: Json;

  @Output()
  save = new EventEmitter<string>();
  @Input()
  actions: ('save' | 'run')[] = [];

  language = new Compartment();

  ngOnInit() {
    this.code = 'console.log(json) // json is the context object so you can investigate it here';
    this.code += '\n'.repeat(20);
    this.recreateView();
    this.editor.focus();
  }

  ngOnChanges() {
    this.updateCMView();
  }

  recreateView() {
    const state = EditorState.create({
      extensions: [
        basicSetup,
        this.language.of(javascript({ typescript: true })),
        indentUnit.of('  ')
      ]
    });
    this.editor = new EditorView({
      doc: this.code,
      state,
      parent: this.textarea.nativeElement
    });
    this.updateCMView();
  }

  private updateCMView() {
    if (this.editor) {
      let transaction = this.editor.state.update({
        changes: { from: 0, to: this.editor.state.doc.length, insert: this.code }
      });
      this.editor.dispatch(transaction);
    }
  }

  emitSaveEvent() {
    this.save.emit(this.editor.state.doc.toString());
  }

  run() {
    this.code = this.editor.state.doc.toString();
    new Function('json', this.code)(this.context);
  }
}
