import dayjs from 'dayjs';

export class TimeService {
  formatDate(date: Date, format = 'YYYY-MM-DD') {
    return dayjs(date).format(format);
  }

  todayAs(format: string) {
    return this.formatDate(new Date(), format);
  }

  todayAsString() {
    return this.formatDate(new Date(), 'YYYY-MM-DD');
  }
}
