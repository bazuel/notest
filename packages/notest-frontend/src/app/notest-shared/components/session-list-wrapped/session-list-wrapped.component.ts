import { Component, Input } from '@angular/core';

@Component({
  selector: 'nt-session-list-wrapped',
  templateUrl: './session-list-wrapped.component.html',
  styleUrls: ['./session-list-wrapped.component.scss']
})
export class SessionListWrappedComponent {
  @Input() referenceList: string[] = [];
  protected readonly Math = Math;
  translateFactor: number = 0;
  pivot!: number;
  rotateStep!: number;

  ngOnInit(): void {
    this.pivot = Math.round(this.referenceList.slice(0, 5).length / 2);
    this.rotateStep = 15 / this.referenceList.slice(0, 5).length;
  }
}
