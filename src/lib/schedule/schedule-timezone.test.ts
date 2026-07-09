import { describe, expect, it } from 'vitest';
import {
  formatScheduleDayLabel,
  formatScheduleTimeZoneLabel,
  getKyivScheduleDateString,
  SCHEDULE_TIME_ZONE,
} from './schedule-timezone';

describe('schedule-timezone', () => {
  it('uses Europe/Kyiv timezone constant', () => {
    expect(SCHEDULE_TIME_ZONE).toBe('Europe/Kyiv');
  });

  it('formats schedule date as yyyy-MM-dd', () => {
    expect(getKyivScheduleDateString(new Date('2026-07-09T12:00:00.000Z'))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });

  it('formats day label for calendar header', () => {
    expect(formatScheduleDayLabel('2026-07-09')).toBe('Thursday, July 9');
  });

  it('formats timezone label without underscore', () => {
    expect(formatScheduleTimeZoneLabel()).toBe('Europe/Kyiv');
  });
});
