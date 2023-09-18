import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'nt-player-utils',
  templateUrl: './player-utils.component.html',
  styleUrls: ['./player-utils.component.scss']
})
export class PlayerUtilsComponent {
  @ViewChild('timeBar', { static: false }) timeBar!: ElementRef<HTMLDivElement>;

  backgroundStyle = '';
  dragCursor = false;
  showTooltip = false;

  @Input() initialTimestamp!: number;
  @Input() finalTimestamp!: number;
  @Input() playing = false;

  @Input() percentage: number = 0;

  @Output() percentageChange = new EventEmitter<number>();
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() speedChange = new EventEmitter<1 | 2 | 4>();

  speed: 1 | 2 | 4 = 1;

  currentTimestamp!: number;
  percentageTooltip!: number;

  ngOnInit(): void {
    this.setBackgroundStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['percentage']) this.setBackgroundStyle();
  }

  setBackgroundStyle() {
    this.backgroundStyle = `
    background: linear-gradient(
      to right,
      var(--nt-primary-color) ${this.percentage}%,
      white ${this.percentage}%
    );`;
  }

  dragStart() {
    this.dragCursor = true;
    this.playing = false;
    this.pause.emit();
  }

  @HostListener('document:mouseup', ['$event'])
  dragEnd() {
    if (!this.dragCursor) return;
    this.dragCursor = false;
    this.percentageChange.emit(this.percentage);
  }

  @HostListener('document:mousemove', ['$event'])
  dragMove(e: MouseEvent) {
    if (!this.dragCursor) return;
    this.setTime(e.clientX);
  }

  clickOnBar(e: MouseEvent) {
    this.setTime(e.clientX);
    this.playing = false;
    this.pause.emit();
    this.percentageChange.emit(this.percentage);
  }

  setTime(currentX: number) {
    const { x, width } = this.timeBar.nativeElement.getBoundingClientRect();
    if (currentX > x + width) this.percentage = 100;
    else if (currentX < x) this.percentage = 0;
    else this.percentage = ((currentX - x) / width) * 100;

    this.percentageTooltip = this.percentage;
    this.currentTimestamp =
      this.initialTimestamp +
      (this.finalTimestamp - this.initialTimestamp) * (this.percentage / 100);
    this.setBackgroundStyle();
  }

  changeSpeed(number: 1 | 2 | 4) {
    if (this.speed == number) this.speed = 1;
    else this.speed = number;
    this.speedChange.emit(this.speed);
  }

  showTooltipAt(currentX: number) {
    const { x, width } = this.timeBar.nativeElement.getBoundingClientRect();
    if (currentX > x + width) this.percentageTooltip = 100;
    else if (currentX < x) this.percentageTooltip = 0;
    else this.percentageTooltip = ((currentX - x) / width) * 100;

    this.currentTimestamp =
      this.initialTimestamp +
      (this.finalTimestamp - this.initialTimestamp) * (this.percentageTooltip / 100);
    this.showTooltip = true;
  }
}
