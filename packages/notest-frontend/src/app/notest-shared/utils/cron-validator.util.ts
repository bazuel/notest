import cronParser from 'cron-parser';
import { FormatDatePipe } from '../../shared/pipes/time.pipe';

export function validateCronExpression(cronExpression: string): boolean {
  const parts = cronExpression.split(' ');

  if (parts.length !== 5) return false;
  if (parts.every((p) => p === '*')) return false; // we cannot have all parts as '*' (otherwise it will run every minute)
  const minute =
    !parts[0].includes('-') &&
    !parts[0].includes(',') &&
    !parts[0].includes('/') &&
    validateCronPart(parts[0], 0, 59);
  const hour = validateCronPart(parts[1], 0, 23);
  const dayOfMonth = validateCronPart(parts[2], 1, 31);
  const month = validateCronPart(parts[3], 1, 12);
  const dayOfWeek = validateCronPart(parts[4], 0, 6);

  return minute && hour && dayOfMonth && month && dayOfWeek;
}

function validateCronPart(part: string, min: number, max: number): boolean {
  if (part === '*') return true;

  const validChars = /^[0-9*\/,-]+$/;
  if (!validChars.test(part)) return false; // Cron expression contains invalid characters

  const values = part.split(',').map((v) => parseInt(v, 10));
  const isRange = part.includes('-');

  if (isRange) {
    const [start, end] = part.split('-').map((v) => parseInt(v, 10));
    return start >= min && end <= max && start <= end;
  }

  const isStep = part.includes('/');

  if (isStep) {
    const [value, step] = part.split('/').map((v) => parseInt(v, 10));
    return value >= min && value <= max && step > 0 && step <= max;
  }

  return values.every((v) => v >= min && v <= max);
}

const formatDataPipe = new FormatDatePipe();

const formatDate = (date: Date) => formatDataPipe.transform(date, 'DD-MM-YYYY, HH:mm');

export function getNextCronJobRun(cronExpression: string): string {
  try {
    const interval = cronParser.parseExpression(cronExpression);
    const nextRun = interval.next().toString();
    const formattedNextRun = new Date(nextRun);

    return `Next run scheduled at ${formatDate(formattedNextRun)}`;
  } catch (error) {
    return 'Invalid cron expression.';
  }
}
