import { Component } from '@angular/core';

@Component({
  selector: 'nt-screenshot-list-placeholder',
  template: `
    <div class="h-fit animate-pulse">
      <div class="bg-nt-50 h-4 rounded-lg my-5 w-28"></div>
      <div class="flex gap-2">
        <div class="bg-nt-50 rounded-lg h-28 w-64 m-2"></div>
        <div class="bg-nt-50 rounded-lg h-28 w-64 m-2"></div>
      </div>
    </div>
  `,
  styleUrls: ['./screenshot-list.component.scss']
})
export class ScreenshotListPlaceholderComponent {}
