import { describe, expect, it } from 'vitest';

import { isPictureInPicturePermissionError } from './safePictureInPicture';

describe('isPictureInPicturePermissionError', () => {
  it('matches Chromium PiP permission rejections', () => {
    expect(isPictureInPicturePermissionError(new TypeError('Permissions check failed'))).toBe(
      true,
    );
    expect(isPictureInPicturePermissionError(new Error('play() failed'))).toBe(false);
  });
});
