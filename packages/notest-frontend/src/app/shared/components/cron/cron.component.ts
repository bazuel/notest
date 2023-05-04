import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'nt-cron',
  templateUrl: './cron.component.html',
  styleUrls: ['./cron.component.scss']
})
export class CronComponent implements OnInit {
  minutes: string = '*';
  hours: string = '';
  daysOfMonth: string = '*';
  months: string = '*';
  daysOfWeek: string = '*';
  weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  daysOfWeekMap = this.weekdays.map((day, i) => ({ number: i + 1, day }));

  @Input()
  scheduleTime?: string = '';

  @Output()
  scheduleTimeChange = new EventEmitter<string>();

  ngOnInit() {
    if (this.scheduleTime) {
      this.parseScheduleTime();
    }
  }

  parseScheduleTime() {
    const splitDate = this.scheduleTime!.split(' ');
    this.minutes = splitDate[0];
    this.hours = splitDate[1];
    this.daysOfMonth = splitDate[2];
    this.months = splitDate[3];
    this.daysOfWeek = splitDate[4];
  }

  saveScheduleDate() {
    const result = this.minutes.concat(
      ' ',
      this.hours || '*',
      ' ',
      this.daysOfMonth,
      ' ',
      this.months,
      ' ',
      this.daysOfWeek + ''
    );
    this.scheduleTime = result === '* * * * *' ? '' : result;
    this.scheduleTimeChange.emit(this.scheduleTime);
  }
}
