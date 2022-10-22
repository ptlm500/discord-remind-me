import { parseDate } from 'chrono-node';
import { faker } from '@faker-js/faker';
import { getMsUntil, parseDateText, getMsUntilTomorrowAt } from './date';

jest.mock('chrono-node');

describe('parseDateText', () => {
  const mParseDate = jest.mocked(parseDate);

  it('calls chrono.parseDate with the provided date text', () => {
    const dateText = 'in 2 sec';

    const date = new Date();
    mParseDate.mockReturnValue(date);

    const returnedDate = parseDateText(dateText);

    expect(mParseDate).toHaveBeenCalledWith(dateText);
    expect(returnedDate).toEqual(date);
  });
});

describe('getMsUntil', () => {
  const now = new Date();
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  it('returns the ms until the provided date, from now', () => {
    const expectedDifferenceInMs = faker.datatype.number();
    const date = new Date(Date.now() + expectedDifferenceInMs);

    expect(getMsUntil(date)).toBe(expectedDifferenceInMs);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});

describe('getMsUntil', () => {
  const HOURS_IN_MS = 1000 * 60 * 60;
  beforeAll(() => {
    jest.useFakeTimers();
    // Set now to 23:00:00:00
    jest.setSystemTime(new Date().setHours(23, 0, 0, 0));
  });

  it('returns the ms until the provided date, from now', () => {
    const hours = faker.datatype.number(23);
    expect(getMsUntilTomorrowAt(hours)).toBe((hours + 1) * HOURS_IN_MS);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
