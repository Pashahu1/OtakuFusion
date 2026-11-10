import { describe, expect, it } from 'vitest';

import { isHardHttpFailure, isRetryableHttpFailure } from './httpFailure';

function http(code: number) {
  return { response: { code } };
}

describe('isHardHttpFailure', () => {
  it('treats permanent 4xx as hard', () => {
    expect(isHardHttpFailure(http(400))).toBe(true);
    expect(isHardHttpFailure(http(403))).toBe(true);
    expect(isHardHttpFailure(http(404))).toBe(true);
    expect(isHardHttpFailure(http(410))).toBe(true);
  });

  it('does not treat rate-limit 4xx as hard', () => {
    expect(isHardHttpFailure(http(408))).toBe(false);
    expect(isHardHttpFailure(http(425))).toBe(false);
    expect(isHardHttpFailure(http(429))).toBe(false);
  });

  it('ignores 5xx and missing codes', () => {
    expect(isHardHttpFailure(http(502))).toBe(false);
    expect(isHardHttpFailure({})).toBe(false);
    expect(isHardHttpFailure(null)).toBe(false);
  });
});

describe('isRetryableHttpFailure', () => {
  it('matches transient 4xx only', () => {
    expect(isRetryableHttpFailure(http(429))).toBe(true);
    expect(isRetryableHttpFailure(http(408))).toBe(true);
    expect(isRetryableHttpFailure(http(404))).toBe(false);
    expect(isRetryableHttpFailure(http(503))).toBe(false);
  });
});
