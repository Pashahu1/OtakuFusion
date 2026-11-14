import { describe, expect, it } from 'vitest';

import type { CatalogHints } from '@/lib/catalog/catalog-hints';
import {
  hikkaRowFitsCatalog,
  hikkaSourceContradictsCatalog,
  scoreHikkaCatalogHit,
} from '@/lib/catalog/providers/hikka/hikkaCatalogIdentity';
import { lookupHikkaSlugOverride } from '@/lib/catalog/providers/hikka/hikkaSlugOverrides';
import type { HikkaAnimeRow } from '@/lib/catalog/providers/hikka/hikkaAnimeRow';

const bleachClassic: HikkaAnimeRow = {
  slug: 'bleach-e87d16',
  mal_id: 269,
  media_type: 'tv',
  title_en: 'Bleach',
  year: 2004,
  episodes_total: 366,
};

const bleachTybw: HikkaAnimeRow = {
  slug: 'bleach-sennen-kessen-hen-72c9ca',
  mal_id: 41467,
  media_type: 'tv',
  title_en: 'Bleach: Thousand-Year Blood War',
  year: 2022,
  episodes_total: 13,
};

const jojo2012: HikkaAnimeRow = {
  slug: 'jojo-no-kimyou-na-bouken-tv-a67ac7',
  mal_id: 14719,
  media_type: 'tv',
  title_en: "JoJo's Bizarre Adventure (2012)",
  year: 2012,
  episodes_total: 26,
};

const steelBallRun: HikkaAnimeRow = {
  slug: 'jojo-no-kimyou-na-bouken-part-7-steel-ball-run-aae44e',
  mal_id: 61469,
  media_type: 'tv',
  title_en: "Steel Ball Run: JoJo's Bizarre Adventure",
  year: 2026,
  episodes_total: 12,
};

function hints(partial: Partial<CatalogHints>): CatalogHints {
  return partial;
}

describe('hikka catalog identity', () => {
  it('rejects classic Bleach when the user opened TYBW', () => {
    const tybwHints = hints({
      format: 'TV',
      seasonYear: 2022,
      episodeCount: 13,
      malId: 41467,
    });
    expect(
      hikkaRowFitsCatalog(bleachClassic, tybwHints, [
        'Bleach: Thousand-Year Blood War',
      ]),
    ).toBe(false);
    expect(
      hikkaRowFitsCatalog(bleachTybw, tybwHints, [
        'Bleach: Thousand-Year Blood War',
      ]),
    ).toBe(true);
  });

  it('rejects JoJo 2012 when the page is Steel Ball Run', () => {
    const sbrHints = hints({
      format: 'TV',
      seasonYear: 2026,
      episodeCount: 12,
      malId: 61469,
    });
    expect(
      hikkaRowFitsCatalog(jojo2012, sbrHints, [
        'STEEL BALL RUN JoJo\'s Bizarre Adventure',
      ]),
    ).toBe(false);
    expect(
      hikkaRowFitsCatalog(steelBallRun, sbrHints, [
        'STEEL BALL RUN JoJo\'s Bizarre Adventure',
      ]),
    ).toBe(true);
  });

  it('does not let a fuzzy "JoJo" title beat a year-matched Steel Ball Run row', () => {
    const sbrHints = hints({
      format: 'TV',
      seasonYear: 2026,
      episodeCount: 12,
    });
    const terms = [
      "STEEL BALL RUN JoJo's Bizarre Adventure",
      "JoJo's Bizarre Adventure",
    ];
    expect(scoreHikkaCatalogHit(jojo2012, terms, sbrHints)).toBe(0);
    expect(scoreHikkaCatalogHit(steelBallRun, terms, sbrHints)).toBeGreaterThan(
      70,
    );
  });

  it('allows ongoing shows to have fewer Hikka episodes than AniList total', () => {
    const row: HikkaAnimeRow = {
      slug: 'ongoing-test',
      media_type: 'tv',
      title_en: 'Ongoing Test',
      year: 2026,
      episodes_total: 6,
    };
    expect(
      hikkaRowFitsCatalog(
        row,
        hints({
          format: 'TV',
          seasonYear: 2026,
          episodeCount: 12,
          isStillAiring: true,
        }),
        ['Ongoing Test'],
      ),
    ).toBe(true);
  });

  it('does not mix Stardust Crusaders cours', () => {
    const stardust: HikkaAnimeRow = {
      slug: 'jojo-no-kimyou-na-bouken-part-3-stardust-crusaders-05f5b6',
      media_type: 'tv',
      title_en: "JoJo's Bizarre Adventure: Stardust Crusaders",
      year: 2014,
      episodes_total: 24,
    };
    const egypt: HikkaAnimeRow = {
      slug: 'jojo-no-kimyou-na-bouken-part-3-stardust-crusaders-2nd-season-d7f0f9',
      media_type: 'tv',
      title_en:
        "JoJo's Bizarre Adventure: Stardust Crusaders - Battle in Egypt",
      year: 2015,
      episodes_total: 24,
    };
    expect(
      hikkaRowFitsCatalog(
        egypt,
        hints({ format: 'TV', seasonYear: 2014, episodeCount: 24 }),
        ["JoJo's Bizarre Adventure: Stardust Crusaders"],
      ),
    ).toBe(false);
    expect(
      hikkaRowFitsCatalog(
        stardust,
        hints({ format: 'TV', seasonYear: 2015, episodeCount: 24 }),
        ["JoJo's Bizarre Adventure: Stardust Crusaders - Battle in Egypt"],
      ),
    ).toBe(false);
  });

  it('rejects a player file that belongs to another JoJo part', () => {
    const stoneOcean =
      'https://ashdi.vip/video/serials/jojo_no_kimyou_na_bouken_part_6_stone_ocean__01.m3u8';
    const terms = [
      "STEEL BALL RUN JoJo's Bizarre Adventure 2nd - 3rd STAGE",
      "JoJo's Bizarre Adventure: Part 7–Steel Ball Run",
    ];
    expect(hikkaSourceContradictsCatalog(stoneOcean, terms)).toBe(true);
    expect(
      hikkaSourceContradictsCatalog(
        'https://cdn.example/steel_ball_run_jojo_01/index.m3u8',
        terms,
      ),
    ).toBe(false);
    expect(
      hikkaSourceContradictsCatalog(
        'https://ashdi.vip/video/jojo_no_kimyou_na_bouken_fanvoxua/s06/jojo_no_kimyou_na_bouken_6__01/index.m3u8',
        terms,
      ),
    ).toBe(true);
  });

  it('looks up franchise overrides by AniList id', () => {
    expect(lookupHikkaSlugOverride(185874)).toBe(
      'bleach-sennen-kessen-hen-kashin-tan-3ce3e3',
    );
    expect(lookupHikkaSlugOverride(210482)).toBe(
      'jojo-no-kimyou-na-bouken-part-7-steel-ball-run-aae44e',
    );
    expect(lookupHikkaSlugOverride(1)).toBeNull();
  });
});
