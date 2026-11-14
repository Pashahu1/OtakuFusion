import { describe, expect, it } from 'vitest';

import { pickAnikotoSearchHit } from './scoreAnikotoSearchHit';
import type { AnikotoSearchHit } from './anikotoTypes';

const FRIEREN: AnikotoSearchHit[] = [
  {
    id: 'frieren-beyond-journey-s-end-c6fbj',
    title: "Frieren: Beyond Journey's End",
    type: 'TV',
    sub: '28',
    dub: '28',
    episodes: '28',
  },
  {
    id: 'frieren-beyond-journey-s-end-season-2-cp7ym',
    title: "Frieren: Beyond Journey's End Season 2",
    type: 'TV',
    sub: '10',
    dub: '10',
    episodes: '10',
  },
  {
    id: 'sousou-no-frieren-marumaru-no-mahou-mini-anime-5pfgv',
    title: 'Sousou no Frieren - Marumaru no Mahou (Mini Anime)',
    type: 'ONA',
    sub: '23',
    dub: null,
    episodes: null,
  },
];

describe('pickAnikotoSearchHit', () => {
  it('picks the main season over the sequel and the mini series', () => {
    const hit = pickAnikotoSearchHit(FRIEREN, ["Frieren: Beyond Journey's End"], {
      episodeCount: 28,
      format: 'TV',
    });
    expect(hit?.id).toBe('frieren-beyond-journey-s-end-c6fbj');
  });

  it('follows an explicit season marker', () => {
    const hit = pickAnikotoSearchHit(
      FRIEREN,
      ["Frieren: Beyond Journey's End Season 2"],
      { format: 'TV' },
    );
    expect(hit?.id).toBe('frieren-beyond-journey-s-end-season-2-cp7ym');
  });

  it('keeps Steel Ball Run stage 2 ahead of the untitled first listing', () => {
    const hits: AnikotoSearchHit[] = [
      {
        id: 'steel-ball-run-jojo-s-bizarre-adventure-rbdlc',
        title: "Steel Ball Run: JoJo's Bizarre Adventure",
        type: 'ONA',
        sub: '1',
        dub: '1',
        episodes: null,
      },
      {
        id: 'steel-ball-run-jojo-s-bizarre-adventure-2nd-stage-56faa',
        title: "Steel Ball Run: JoJo's Bizarre Adventure 2nd Stage",
        type: 'ONA',
        sub: '8',
        dub: '8',
        episodes: '11',
      },
    ];
    const hit = pickAnikotoSearchHit(
      hits,
      ["STEEL BALL RUN JoJo's Bizarre Adventure 2nd - 3rd STAGE"],
      { episodeCount: 11, format: 'ONA' },
    );
    expect(hit?.id).toBe('steel-ball-run-jojo-s-bizarre-adventure-2nd-stage-56faa');
  });

  it('rejects a weak title overlap', () => {
    const hit = pickAnikotoSearchHit(FRIEREN, ['Naruto'], { format: 'TV' });
    expect(hit).toBeNull();
  });
});
