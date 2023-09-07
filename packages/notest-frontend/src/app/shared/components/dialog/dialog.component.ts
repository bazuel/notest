import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'nt-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  showConfirm = false;
  showAlert = false;
  text = '';

  callbackConfirmResponse!: (r: boolean) => void;
  callbackAlertResponse!: () => void;

  ngOnInit() {
    this.addDialog();
  }

  private addDialog() {
    dialog = { confirm: (text) => this.confirm(text), alert: (text) => this.alert(text) };
  }

  private async confirm(text: string) {
    this.text = text;
    this.showConfirm = true;
    return await new Promise<boolean>((r) => (this.callbackConfirmResponse = r));
  }

  private async alert(text: string) {
    this.text = text;
    this.showAlert = true;
    await new Promise<void>((r) => (this.callbackAlertResponse = r));
  }
}

export let dialog: {
  confirm: (text: string) => Promise<boolean>;
  alert: (text: string) => Promise<void>;
};
