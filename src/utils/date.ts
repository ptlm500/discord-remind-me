import { addMilliseconds, formatDistanceToNow, setHours, startOfTomorrow } from 'date-fns';
import chrono from 'chrono-node';

export const humanizeDelay = (delay: number) => {
  const now = new Date();
  const reminderTime = addMilliseconds(now, delay);

  return `${formatDistanceToNow(reminderTime)}`;
};

export const parseDateText = (text: string) => {
  const parsedDate = chrono.en.GB.parseDate(text);

  if (!parsedDate) {
    throw new Error(`I couldn't understand that time "${text}"`);
  }

  return parsedDate;
};

export const getMsUntil = (date: Date) => {
  const now = new Date();
  return date.getTime() - now.getTime();
};

export const getMsUntilTomorrowAt = (hour: number) => {
  const tomorrow = startOfTomorrow();

  return getMsUntil(setHours(tomorrow, hour));
};
