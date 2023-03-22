import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {TokenService} from "../../services/token.service";

@Component({
  selector: 'nt-profile-image',
  template: `
    <div #profileImage class="flex items-center justify-center">
      <img class="rounded-full h-10 w-10" *ngIf="imgSrc" [src]="imgSrc | safeUrl" />
      <div *ngIf="!imgSrc">{{ initials }}</div>
    </div>
  `,
  styles: [
    `
      :host {
        @apply flex items-center justify-center h-10 w-10 rounded-full bg-nt-50 text-gray-600 overflow-hidden;
        &.profile-sm {
          @apply scale-50;
        }
      }
    `
  ]
})
export class ProfileImageComponent implements OnInit {
  @Input()
  userid?: string;

  @Input()
  fullname = '';

  @Input()
  imagePath? = '';

  imgSrc = '';
  initials = '';

  @ViewChild('profileImage') elementRef?: ElementRef;

  constructor(private tokenService: TokenService) {}

  async ngOnInit() {
    this.fullname = this.tokenService.tokenData().name + this.tokenService.tokenData().surname;
    if (this.fullname) this.initials = getInitialsFormString(this.fullname);
  }
}

export function getInitialsFormString(s?: string): string {
  if (!s) {
    return '';
  }
  return s
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}
