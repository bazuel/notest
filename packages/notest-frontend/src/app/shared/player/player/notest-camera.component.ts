import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { BLDomEvent } from "@notest/common";
import { PlayerComponent } from "./player.component";

@Component({
  selector: "nt-camera",
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
export class NotestCameraComponent implements AfterViewInit {
  @ViewChild("camera", { static: true })
  camera!: ElementRef<HTMLDivElement>;

  @Input()
  domEvent!: BLDomEvent;

  @Output()
  playerUpdate = new EventEmitter<{ timestamp: number; last?: boolean }>();

  @Output()
  playerResize = new EventEmitter<{ scale: number }>();

  @Output()
  playerClick = new EventEmitter<void>();

  private player!: PlayerComponent;

  @Output()
  iframeChanged = new EventEmitter<{ iframe: HTMLIFrameElement }>();

  constructor() {}

  ngOnChanges(): void {
    if (this.domEvent) this.updatePlayerSession();
  }

  async ngAfterViewInit() {
    if (this.domEvent) this.updatePlayerSession();
    document.addEventListener("bl-devtool-resize", () => {
      this.player.updatePlayerZoom();
    });
  }

  private updatePlayerSession() {
    if (!this.player) {
      this.player = new PlayerComponent(this.camera.nativeElement, {
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
    }
    //let domFullTimestamp = this.session.find(h => (h as BLDomEvent).full)!.timestamp
    this.player.setEvents([this.domEvent]);
    this.iframeChanged.emit({
      iframe: this.camera.nativeElement.querySelector("iframe")!,
    });
  }
}
