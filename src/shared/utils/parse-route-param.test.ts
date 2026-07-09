import { describe, expect, it } from 'vitest';
import { parseRouteParam } from './parse-route-param';

describe('parseRouteParam', () => {
  it('returns string param as-is', () => {
    expect(parseRouteParam('195600')).toBe('195600');
  });

  it('returns first element from array param', () => {
    expect(parseRouteParam(['first', 'second'])).toBe('first');
  });

  it('returns empty string for empty array', () => {
    expect(parseRouteParam([])).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(parseRouteParam(undefined)).toBe('');
  });
});
