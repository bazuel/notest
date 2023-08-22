import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import * as updateLocale from 'dayjs/plugin/updateLocale';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('it');
dayjs.extend(updateLocale);
dayjs.extend(relativeTime);

const r = /^\d+$/;

export function getDate(value) {
  let v = value;
  if (r.test(value)) v = +value;
  if (typeof v === 'string' || v instanceof String) return new Date(Date.parse(v as string));
  else if (v instanceof Date) return v as Date;
  else if (!isNaN(v)) return new Date(v as number);
  else return new Date(value);
}

@Pipe({
  name: 'fromNow'
})
export class FromNowPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) return '';
    const date = getDate(value);
    return dayjs(date).fromNow();
  }
}

@Pipe({
  name: 'diffMsFromNow'
})
export class DiffMsFromNowPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (value == null || value == undefined) return '';
    const date = getDate(value);
    return dayjs(date).diff(new Date(), 'milliseconds');
  }
}

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {
  transform(value, format?: string): string {
    if (value == null || value == undefined) return '';
    if (!format) {
      format = 'DD/MM/YYYY';
    }
    const date = getDate(value);
    return dayjs(date).format(format);
  }
}

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {
  transform(value, format?: string): string {
    if (value == null || value == undefined) return '';
    if (!format) {
      format = 'HH:mm';
    }
    const date = getDate(value);
    return dayjs(date).format(format);
  }
}

@Pipe({
  name: 'minusOneMonth'
})
export class MinusOneMonthDatePipe implements PipeTransform {
  transform(value): string {
    const date = getDate(value);
    return dayjs(date)
      .month(dayjs(date).month() - 1)
      .format('YYYY-MM-DD');
  }
}

@Pipe({
  name: 'plusOneMonth'
})
export class PlusOneMonthDatePipe implements PipeTransform {
  transform(value): string {
    const date = getDate(value);
    return dayjs(date)
      .month(dayjs(date).month() + 1)
      .format('YYYY-MM-DD');
  }
}
