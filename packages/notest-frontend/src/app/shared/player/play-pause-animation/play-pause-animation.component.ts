import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'nt-play-pause-animation',
  templateUrl: './play-pause-animation.component.html',
  styleUrls: ['./play-pause-animation.component.scss']
})
export class PlayPauseAnimationComponent implements OnChanges {
  @Input()
  playing = false;
  showPlayIcon = false;
  showPauseIcon = false;

  first = true;

  constructor() {}

  ngOnChanges(): void {
    console.log('playing: ', this.playing);
    if (this.first) {
      this.first = false;
    } else this.manageAnimation();
  }

  private manageAnimation() {
    console.log('playing: ', this.playing);
    if (this.playing) this.showPlayIcon = true;
    else this.showPauseIcon = true;
    setTimeout(() => {
      this.showPlayIcon = false;
      this.showPauseIcon = false;
    }, 700);
  }
}
