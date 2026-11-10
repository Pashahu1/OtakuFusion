import { describe, expect, it } from 'vitest';

import {
  fromPluginAnime4kMode,
  isAnime4kEnhanceMode,
  toPluginAnime4kMode,
} from './anime4kMode';

describe('anime4kMode', () => {
  it('maps Restore to the plugin balanced preset and back', () => {
    expect(toPluginAnime4kMode('restore')).toBe('balanced');
    expect(fromPluginAnime4kMode('balanced')).toBe('restore');
    expect(fromPluginAnime4kMode('performance')).toBe('restore');
  });

  it('passes through Off / Quality / Auto', () => {
    expect(toPluginAnime4kMode('off')).toBe('off');
    expect(toPluginAnime4kMode('quality')).toBe('quality');
    expect(toPluginAnime4kMode('auto')).toBe('auto');
    expect(fromPluginAnime4kMode('auto')).toBe('auto');
  });

  it('accepts only the four user-facing modes', () => {
    expect(isAnime4kEnhanceMode('restore')).toBe(true);
    expect(isAnime4kEnhanceMode('balanced')).toBe(false);
  });
});
