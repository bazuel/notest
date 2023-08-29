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
import { debounce } from '@notest/common';
import { IComponent } from '../../directives/component-injector.directive';
import { HighlightPipe } from '../../pipes/highlight.pipe';

@Component({
  selector: 'nt-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss']
})
export class AutocompleteComponent<T = any> implements OnInit, OnChanges {
  @ViewChild('popup', { static: false }) popup?: ElementRef;
  @ViewChild('queryInput', { static: true }) queryInput!: ElementRef;

  @Input() component?: IComponent;

  @Input()
  items: T[] = [];

  itemsToShow: T[] = [];

  @Input()
  item?: T;

  @Output()
  itemSelected = new EventEmitter<T>();

  @Output()
  emptySelection = new EventEmitter<void>();

  @Input()
  show = false;

  @Input()
  filterCallBack?: (i: T, query: string) => boolean;

  @Input('input-class')
  inputClasses = '';
  @Input('menu-class')
  menuClasses = '';

  @Input()
  disabled = false;

  @Input()
  required = false;

  @Input()
  query? = '';

  @Output()
  queryChanged = new EventEmitter<string>();
  @Input()
  placeholder = '';

  @Input()
  property = '';

  @Input('second-property')
  secondProperty = '';

  @Input('property-id')
  propertyId? = '';

  @Input('selected-id')
  selectedId: string | number | undefined = '';

  @Input('third-property')
  thirdProperty = '';

  style: { left: string; top: string } = { left: '', top: '' };
  @Input()
  tooltipProperty?: string;

  @Input()
  hideMenuOnSelect = true;

  currentIndex = -1;

  @Input()
  showKeys = false;

  @Input()
  keysMapLabel: { [k in keyof T]: string } | {} = {};

  @Output()
  blur = new EventEmitter();
  @Output()
  onEnter = new EventEmitter<string>();
  @Output()
  queryEmpty = new EventEmitter();

  itemsHeight = 40;

  highlight = new HighlightPipe();

  ngOnInit() {
    if (!this.query) this.query = '';
    if (!this.selectedId) this.selectedId = '';
    window.addEventListener(
      'scroll',
      debounce(() => {
        if (this.show) this.setPopupPosition();
      }, 100),
      true
    );
    this.updateItemsToShow();
    this.setSelected();
  }

  private setSelected() {
    if (this.selectedId) {
      const found = this.items.find(
        (i) => (this.propertyId ? i[this.propertyId] : i) == this.selectedId
      );
      if (found) {
        this.query = this.property
          ? `${found[this.property]}${
              this.secondProperty ? ' - ' + found[this.secondProperty] : ''
            }`
          : found + '';
      }
    }
  }

  setPopupPosition() {
    const popupHeight =
      this.itemsToShow.length * this.itemsHeight < 300 // max height is setted in styles
        ? this.itemsToShow.length * this.itemsHeight
        : 300; // max height is setted in styles

    setTimeout(() => {
      if (this.queryInput && this.popup) {
        const pinnedRect = this.queryInput.nativeElement.getBoundingClientRect();
        if (this.popup) {
          if (pinnedRect.top + popupHeight > window.innerHeight) {
            this.popup.nativeElement.style.top = pinnedRect.top - popupHeight + 'px';
          } else {
            this.popup.nativeElement.style.top = pinnedRect.top + pinnedRect.height + 'px';
          }
          this.popup.nativeElement.style.left = pinnedRect.left + 'px';
        }
      }
    }, 10);
  }

  ngOnChanges(): void {
    this.updateItemsToShow();
  }

  onQueryChange(s: string) {
    this.show = true;
    this.queryChanged.emit(s);
    this.updateItemsToShow(s);
    if (s == '') {
      this.queryEmpty.emit();
    }
  }

  onItemClick(i: T) {
    console.log('i: ', i);
    this.query = '';
    if (!i[this.property] && i && typeof i === 'string') this.query = i;
    if (i[this.property]) this.query = i[this.property];
    if (i[this.secondProperty]) this.query = i[this.property] + ' ' + i[this.secondProperty];
    this.item = i;
    this.itemSelected.emit(this.item);
    if (this.hideMenuOnSelect)
      setTimeout(() => {
        this.show = false;
      }, 10);
  }

  checkifEmptyAndEmit() {
    if (this.query !== '') {
      this.updateItemsToShow();
    } else {
      this.emptySelection.emit();
    }
  }

  updateItemsToShow(query = '') {
    if (query == '') {
      if (this.items) this.itemsToShow = [...this.items];
    } else {
      const value = (i) =>
        `${i[this.property] ?? i} ${i[this.secondProperty] ?? ''} ${i[this.thirdProperty] ?? ''}`;
      const inQuery = (i) => {
        if (this.filterCallBack) {
          return this.filterCallBack(i, query);
        }
        const s = value(i);
        return s.toLowerCase().indexOf(query.toLowerCase()) >= 0;
      };

      this.itemsToShow = this.items.filter(inQuery).sort((i1, i2) => {
        const s1 = value(i1);
        const s2 = value(i2);
        try {
          if (s1.indexOf(query) == 0) return -1;
          else if (s2.indexOf(query) == 0) return 1;
          else return 0;
        } catch {
          return 0;
        }
      });
      console.log(this.itemsToShow);
    }
  }

  makeQueryEmpty() {
    this.query = '';
    console.log('this: ', this);
  }

  next() {
    this.currentIndex = Math.min(this.currentIndex + 1, this.itemsToShow.length - 1);
  }

  prev() {
    this.currentIndex = Math.max(-1, this.currentIndex - 1);
  }

  enterOnSelected() {
    const found = this.itemsToShow[this.currentIndex];
    if (found) this.onItemClick(found);
    this.onEnter.emit(this.query);
  }

  setText(item: T) {
    const highlighted = (data) => this.highlight.transform(data, this.query);
    const value = (i, property) =>
      highlighted(typeof i === 'string' ? i || '??' : i[property] || '??');
    let text;
    if (this.showKeys && this.keysMapLabel) {
      text = `${this.keysMapLabel[this.property]}: ${value(item, this.property)}`;
      if (this.secondProperty) {
        text += ` - ${this.keysMapLabel[this.secondProperty]}: ${value(item, this.secondProperty)}`;
        if (this.thirdProperty) {
          text += ` - ${this.keysMapLabel[this.thirdProperty]}: ${value(item, this.thirdProperty)}`;
        }
      }
    } else {
      text = value(item, this.property);
      if (this.secondProperty) {
        text += ` - ${value(item, this.secondProperty)}`;
        if (this.thirdProperty) {
          text += ` - ${value(item, this.thirdProperty)}`;
        }
      }
    }
    return text;
  }
}

/*
@Component({
  selector: 'sm-dossier-info-component',
  template: `
    <div class="flex">
      <div>{{ data.surname }}</div>
      <div>{{ data.name }}</div>
      <div>{{ data.ragione_sociale }}</div>
      <div>{{ data.date_start }}</div>
    </div>
  `,
  styles: [
    `
      :host {
        @apply p-2;
      }
    `
  ]
})
export class DefaultItemComponent {
  @Input() data!: SMDossierInfo;
}*/
