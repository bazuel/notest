import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'bl-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss']
})
export class SvgIconComponent implements OnInit {
  @Input()
  path!: string;

  @HostBinding('class') @Input('class') classList = '';

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

  ngOnInit(): void {}
}
