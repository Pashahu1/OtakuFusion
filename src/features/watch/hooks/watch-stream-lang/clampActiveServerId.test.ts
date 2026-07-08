import { describe, expect, it } from 'vitest';
import {
  WATCH_SERVER_DUB_ID,
  WATCH_SERVER_SUB_ID,
} from '@/shared/data/servers';
import { clampActiveServerId } from './clampActiveServerId';

type ClampInput = {
  id: string | null;
  userChoseDub: boolean;
  provider: 'aniliberty' | 'hikka' | 'anikoto';
  catalogHasDub: boolean;
  episodeHasDub: boolean | undefined;
};

const cases: Array<{
  name: string;
  input: ClampInput;
  expected: string | null;
}> = [
  {
    name: 'userChoseDub keeps dub on hikka',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: true,
      provider: 'hikka',
      catalogHasDub: false,
      episodeHasDub: false,
    },
    expected: WATCH_SERVER_DUB_ID,
  },
  {
    name: 'userChoseDub keeps dub on anikoto when catalog and episode have dub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: true,
      provider: 'anikoto',
      catalogHasDub: true,
      episodeHasDub: true,
    },
    expected: WATCH_SERVER_DUB_ID,
  },
  {
    name: 'userChoseDub keeps dub on anikoto even without catalog dub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: true,
      provider: 'anikoto',
      catalogHasDub: false,
      episodeHasDub: false,
    },
    expected: WATCH_SERVER_DUB_ID,
  },
  {
    name: 'hikka keeps sub id',
    input: {
      id: WATCH_SERVER_SUB_ID,
      userChoseDub: false,
      provider: 'hikka',
      catalogHasDub: true,
      episodeHasDub: true,
    },
    expected: WATCH_SERVER_SUB_ID,
  },
  {
    name: 'hikka clamps dub to sub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: false,
      provider: 'hikka',
      catalogHasDub: true,
      episodeHasDub: true,
    },
    expected: WATCH_SERVER_SUB_ID,
  },
  {
    name: 'aniliberty clamps dub to sub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: false,
      provider: 'aniliberty',
      catalogHasDub: true,
      episodeHasDub: true,
    },
    expected: WATCH_SERVER_SUB_ID,
  },
  {
    name: 'hikka preserves null id',
    input: {
      id: null,
      userChoseDub: false,
      provider: 'hikka',
      catalogHasDub: false,
      episodeHasDub: undefined,
    },
    expected: null,
  },
  {
    name: 'anikoto keeps sub id',
    input: {
      id: WATCH_SERVER_SUB_ID,
      userChoseDub: false,
      provider: 'anikoto',
      catalogHasDub: false,
      episodeHasDub: false,
    },
    expected: WATCH_SERVER_SUB_ID,
  },
  {
    name: 'anikoto clamps dub when catalog has no dub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: false,
      provider: 'anikoto',
      catalogHasDub: false,
      episodeHasDub: undefined,
    },
    expected: WATCH_SERVER_SUB_ID,
  },
  {
    name: 'anikoto clamps dub when episode explicitly has no dub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: false,
      provider: 'anikoto',
      catalogHasDub: true,
      episodeHasDub: false,
    },
    expected: WATCH_SERVER_SUB_ID,
  },
  {
    name: 'anikoto keeps dub when episode dub is unknown',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: false,
      provider: 'anikoto',
      catalogHasDub: true,
      episodeHasDub: undefined,
    },
    expected: WATCH_SERVER_DUB_ID,
  },
  {
    name: 'anikoto keeps dub when episode has dub',
    input: {
      id: WATCH_SERVER_DUB_ID,
      userChoseDub: false,
      provider: 'anikoto',
      catalogHasDub: true,
      episodeHasDub: true,
    },
    expected: WATCH_SERVER_DUB_ID,
  },
];

describe('clampActiveServerId', () => {
  it.each(cases)('$name', ({ input, expected }) => {
    expect(
      clampActiveServerId(
        input.id,
        input.userChoseDub,
        input.provider,
        input.catalogHasDub,
        input.episodeHasDub,
      ),
    ).toBe(expected);
  });
});
