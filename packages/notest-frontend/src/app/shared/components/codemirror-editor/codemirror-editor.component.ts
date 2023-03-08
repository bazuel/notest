import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { basicSetup, EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorState, Compartment } from '@codemirror/state';
import { copyToClipboard } from '@notest/common';

@Component({
  selector: 'nt-codemirror-editor',
  templateUrl: './codemirror-editor.component.html',
  styleUrls: ['./codemirror-editor.component.scss']
})
export class CodemirrorEditorComponent implements OnInit, OnChanges {
  @Input() script = '';
  @Input() label = '';
  @ViewChild('textareaContainer', { static: true }) textareaContainer!: ElementRef;

  language = new Compartment();
  cmView;

  ngOnInit() {
    this.recreateView();
    this.cmView.focus();
  }

  ngOnChanges(changes) {
    this.updateCMView();
  }

  recreateView() {
    const state = EditorState.create({
      extensions: [basicSetup, this.language.of(javascript({ typescript: true }))]
    });
    this.cmView = new EditorView({
      doc: this.script,
      state,
      parent: this.textareaContainer.nativeElement
    });
    this.updateCMView();
  }

  private updateCMView() {
    if (this.cmView) {
      let transaction = this.cmView.state.update({
        changes: { from: 0, to: this.cmView.state.doc.length, insert: this.script }
      });
      this.cmView.dispatch(transaction);
    }
  }

  onCopyClick() {
    copyToClipboard(this.script);
    const popupCopied = document.getElementById('copied')!;
    popupCopied.classList.remove('hidden');
    setTimeout(() => {
      popupCopied.classList.add('hidden');
    }, 2000);
  }

  onDownloadClick() {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.script)
    );
    element.setAttribute('download', 'script.js');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
  }
}
