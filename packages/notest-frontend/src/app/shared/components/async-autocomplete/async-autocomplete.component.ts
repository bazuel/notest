import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { debounce } from '@notest/common';
import { IComponent } from '../../directives/component-injector.directive';

@Component({
  selector: 'nt-async-autocomplete',
  templateUrl: './async-autocomplete.component.html',
  styleUrls: ['./async-autocomplete.component.scss']
})
export class AsyncAutocompleteComponent<T = any> implements OnInit {
  @Input() component?: IComponent<T>;

  @Input()
  searchFunction: (q: string) => Promise<T[]> = () => Promise.resolve([]);
  @Input()
  property = '';

  @Input('second-property')
  secondProperty = '';

  @Input('third-property')
  thirdProperty = '';

  @Input('property-id')
  propertyId = '';

  @Input('selected-id')
  selectedId: string | number | undefined = '';

  @Input()
  query? = '';

  @Input()
  menuClasses = '';

  @Input()
  debounceTime = 50;

  @Input()
  placeholder = '';

  items: T[] = [];

  private searchItemsDebounced = debounce(
    async (q: string) => (this.items = await this.searchFunction(q)),
    this.debounceTime
  );
  @Output()
  itemSelected = new EventEmitter<T>();

  @Output()
  itemSelectedAndIndex = new EventEmitter<{ item: T; index: number }>();

  @Output()
  queryChanged = new EventEmitter<string>();

  @Input()
  showKeys = false;
  @Input()
  keysMapLabels: { [k in keyof T]: string } | {} = {};

  ngOnInit() {
    if (!this.query) this.query = '';
  }

  async searchItems(q: string) {
    this.searchItemsDebounced(q);
  }

  async update() {
    await this.searchItems('');
  }
}
