import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { BLSessionEvent } from "@notest/common";
import { PlayerComponent } from "./player.component";

@Component({
  selector: "nt-shared-player",
  template: ` <div #camera class="camera"></div> `,
  styles: [
    `
      :host {
        display: block;
      }

      .camera {
        display: flex;
        align-items: center;
        max-width: 100%;
        max-height: 100%;
        justify-content: center;
      }
    `,
  ],
})
export class NotestPlayerComponent implements AfterViewInit, OnChanges {
  @ViewChild("camera", { static: true })
  camera!: ElementRef<HTMLDivElement>;
  @Input()
  session!: BLSessionEvent[];

  @Input()
  speed = 1;

  @Output()
  playerUpdate = new EventEmitter<{ timestamp: number; last?: boolean }>();

  @Output()
  playerResize = new EventEmitter<{ scale: number }>();

  @Output()
  playerClick = new EventEmitter<void>();

  private player!: PlayerComponent;

  constructor() {}

  forward(ms = 100) {
    this.player.forward(ms);
  }

  backward(ms = 100) {
    this.player.forward(-1 * ms);
  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  ngOnChanges(changes): void {
    if (changes.speed) {
      this.player?.setSpeed(changes.speed.currentValue);
    }
    if (changes.session) if (this.session) this.updatePlayerSession();
  }

  async ngAfterViewInit() {
    if (this.session) this.updatePlayerSession();
    this.player?.setSpeed(this.speed);
    document.addEventListener("bl-devtool-resize", () => {
      this.player.updatePlayerZoom();
    });
  }

  moveTo(timestamp: number) {
    if (timestamp < this.session[0].timestamp)
      throw new Error(
        "Provided timestamp is lesser than session timestamp range"
      );
    if (timestamp > this.session[this.session.length - 1].timestamp)
      throw new Error(
        "Provided timestamp is greater than session timestamp range"
      );
    this.player.moveTo(timestamp);
  }

  private updatePlayerSession() {
    if (!this.player) {
      let player = new PlayerComponent(this.camera.nativeElement, {
        deserializerProxyBasePath: "http://localhost:2550", //this.config.proxyBasePath,
        onTimestampChange: (ts, last?: boolean) => {
          this.playerUpdate.emit({ timestamp: Math.round(ts), last });
        },
        onIframeClick: () => {
          this.playerClick.emit();
        },
        onResize: (scale) => {
          this.playerResize.emit({ scale });
        },
      });
      this.player = player;
    }
    //let domFullTimestamp = this.session.find(h => (h as BLDomEvent).full)!.timestamp
    this.player.setEvents(this.session);
  }
}
