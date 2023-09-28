import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'nt-screenshot',
  templateUrl: './screenshot.component.html',
  styleUrls: ['./screenshot.component.scss']
})
export class ScreenshotComponent implements OnInit {
  @Input()
  reference!: string;
  @Input()
  name?: string;

  @Input()
  imageUrl?: string;

  @Input() lazyload = false;

  @ViewChild('screenshot', { static: true }) elementRef?: ElementRef;

  imgSrc = '';

  constructor(private mediaService: MediaService) {}

  async ngOnInit() {
    if (this.imageUrl) {
      this.imgSrc = this.imageUrl;
      return;
    }
    if (!this.reference) return;
    if (this.lazyload) {
      this.mediaService.lazyloadImage(
        this.reference,
        this.name ?? 'shot',
        (imgSrc) => (this.imgSrc = imgSrc),
        () => this.isElementInViewport()
      );
    } else
      this.mediaService.getImgSource(this.reference, this.name ?? 'shot').then((res) => {
        this.imgSrc = res;
      });
  }

  private isElementInViewport() {
    const rect = this.elementRef!.nativeElement.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) * 2 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
}
