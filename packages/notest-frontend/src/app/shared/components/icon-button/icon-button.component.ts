import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { BOIcon, icons } from '../icon/icon.component';

@Component({
  selector: 'bl-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss']
})
export class IconButtonComponent implements OnInit {
  @HostBinding('class') @Input('class') classList = '';

  @Input()
  link: string | undefined = '';

  @Input()
  tooltip = '';

  @Input()
  icon!: BOIcon;

  constructor(private host: ElementRef) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.classList = this.host.nativeElement.className;
        }
      });
    });
    observer.observe(host.nativeElement, {
      attributes: true
    });
  }

  ngOnInit(): void {
    console.log(this.icon);
  }
}
