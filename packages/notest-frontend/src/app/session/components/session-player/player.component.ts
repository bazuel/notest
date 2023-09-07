import { Component, Input, ViewChild } from '@angular/core';
import { BLSessionEvent } from '@notest/common';
import { NotestPlayerComponent } from '../../../shared/player/player/notest-player.component';

@Component({
  selector: 'nt-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
  @Input()
  session: BLSessionEvent[] = [];
  @Input()
  interactive = true;

  @ViewChild('player', { static: false })
  screen!: NotestPlayerComponent;
  playing = false;
  currentTimestamp!: number;

  currentPercentage = 0;
  speed: 1 | 2 | 4 = 1;

  pause() {
    this.playing = false;
    this.screen.pause();
  }

  play() {
    this.playing = true;
    this.screen.play();
  }

  togglePlaying() {
    if (this.playing) this.pause();
    else this.play();
  }

  onPlayerUpdate(e: { timestamp: number; last?: boolean }) {
    this.updateCurrentTimestamp(e.timestamp);
    const totalMilliseconds =
      this.session[this.session.length - 1].timestamp - this.session[0].timestamp;
    const currentMilliseconds = this.currentTimestamp - this.session[0].timestamp;
    this.currentPercentage = (currentMilliseconds / totalMilliseconds) * 100;
    if (e.last) {
      this.pause();
      this.screen.moveTo(this.session[0].timestamp);
      this.currentPercentage = 0;
    }
  }

  onPlayerResize(e: { scale: number }) {}

  updateCurrentTimestamp(timestamp: number) {
    if (this.session && this.session.length > 0) {
      const min = this.session[0].timestamp;
      const max = this.session[this.session.length - 1].timestamp;
      this.currentTimestamp = Math.max(min, Math.min(max, Math.round(timestamp)));
    }
  }

  setVideoTimestamp(percentage: number) {
    const min = this.session[0].timestamp;
    const max = this.session[this.session.length - 1].timestamp;
    const timestamp = Math.round((max - min) * (percentage / 100) + min);
    this.screen.moveTo(timestamp);
  }
}
