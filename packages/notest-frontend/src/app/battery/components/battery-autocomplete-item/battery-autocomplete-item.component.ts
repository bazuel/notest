import { Component, Input } from '@angular/core';

@Component({
  selector: 'nt-battery-autocomplete-item',
  template: `
    <div class="p-2 shadow-xl rounded-lg w-64 cursor-pointer">
      {{ (data | formatDate : 'DD-MM-YYYY, HH:mm') || '' }}
    </div>
  `,
  styleUrls: ['./battery-autocomplete-item.component.scss']
})
export class BatteryAutocompleteItemComponent {
  @Input() data!: number;
  @Input() query!: string;
}
