import { Component } from '@angular/core';

@Component({
  selector: 'nt-session-preview-placeholder',
  template: `
    <div class="h-full w-full flex animate-pulse p-5">
      <div class="relative w-2/3 h-2/3">
        <div class="bg-nt-50 h-8 rounded-lg my-5 w-56"></div>
        <div class="absolute w-10/12 h-[85%] bg-nt-50 rounded-lg"></div>
      </div>
      <div class="w-1/3 h-4/5 px-8">
        <div class="flex justify-items items-center">
          <label class="text-2xl my-4 mr-4">Run history</label>
          <div class="bo-button-icon pointer-events-none w-10 h-10 bo-loading p-0"></div>
          <div class="text-nt-300 ml-4 text-bold text-lg">Your session is running...</div>
        </div>
        <div class="h-full overflow-auto">
          <div class="h-fit animate-pulse">
            <div class="bg-nt-50 h-4 rounded-lg my-5 w-28"></div>
            <div class="flex gap-2">
              <div class="bg-nt-50 rounded-lg h-28 w-64 m-2"></div>
              <div class="bg-nt-50 rounded-lg h-28 w-64 m-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SessionPreviewPlaceholderComponent {}
