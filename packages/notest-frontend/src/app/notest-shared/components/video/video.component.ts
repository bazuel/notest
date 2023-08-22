import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MediaService } from '../../services/media.service';
import { HttpService } from '../../../shared/services/http.service';

@Component({
  selector: 'nt-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnChanges {
  @ViewChild('video', { static: true }) videoElementRef?: ElementRef;

  @Input() reference!: string;
  @Input() name?: string;

  src?: string;
  srcBuffered?: string;
  loaded = false;

  constructor(private mediaService: MediaService, private httpService: HttpService) {}

  ngOnInit(): void {
    this.videoElementRef?.nativeElement.addEventListener('loadeddata', () => {
      this.loaded = true;
    });
    this.src = undefined;
    this.srcBuffered = undefined;
    this.loaded = false;
    setTimeout(() => {
      this.loadVideo();
    }, 10);
  }

  async ngOnChanges() {}

  private async loadVideo() {
    this.src = await this.httpService.url(
      `/media/video-download?name=video&reference=${this.reference}`
    );
    this.mediaService.getVideoSource(this.reference, this.name ?? 'video').then((res) => {
      this.srcBuffered = res;
    });
  }

  play(timeInSeconds?: number) {
    if (timeInSeconds && timeInSeconds >= 0)
      this.videoElementRef!.nativeElement.currentTime = timeInSeconds;
    this.videoElementRef?.nativeElement.play();
  }

  pause() {
    this.videoElementRef?.nativeElement.pause();
  }

  stop() {
    this.videoElementRef?.nativeElement.pause();
    this.videoElementRef!.nativeElement.currentTime = 0;
  }
}
