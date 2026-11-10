import type Artplayer from 'artplayer';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';

import { SUBTITLE_NONE_ID, SUBTITLE_NONE_LABEL } from '../playerConstants';
import {
  readSubtitlePreference,
  writeSubtitlePreference,
} from '../playerPlaybackPreferences';
import { resolveAssetPlaybackUrl } from '../playerStream';
import { patchTracksPanelModel, type TracksSubtitleOption } from './tracksPanelModel';

export interface ResolvedSubtitleTracks {
  playable: Array<SubtitleItem & { file: string }>;
  activeLabel: string | null;
}

export function resolveAndApplySubtitles(
  art: Artplayer,
  subtitles: SubtitleItem[] | null,
  streamLang: 'sub' | 'dub' | null,
  assetRequestHeaders: Record<string, string>,
): ResolvedSubtitleTracks {
  art.subtitle.style({
    fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
  });

  const playable = (subtitles ?? [])
    .map((sub) => ({
      ...sub,
      file: resolveAssetPlaybackUrl(sub.file, assetRequestHeaders),
    }))
    .filter((sub) => sub.file.trim().length > 0);

  const defaultEnglishSub =
    playable.find(
      (sub) => sub.label.toLowerCase().includes('english') && sub.default,
    ) || playable.find((sub) => sub.label.toLowerCase().includes('english'));

  const subPref = readSubtitlePreference();
  const streamWantsSub = streamLang !== 'dub';
  let shouldShowSub = streamWantsSub;
  if (subPref?.mode === 'off') shouldShowSub = false;
  if (subPref?.mode === 'on') shouldShowSub = true;

  let active: (typeof playable)[0] | null = null;
  if (shouldShowSub) {
    if (subPref?.mode === 'on' && subPref.label.trim()) {
      const match = playable.find(
        (s) => s.label.trim().toLowerCase() === subPref.label.trim().toLowerCase(),
      );
      active = match ?? defaultEnglishSub ?? playable[0] ?? null;
    } else {
      active = defaultEnglishSub ?? playable[0] ?? null;
    }
  }

  if (active) {
    art.subtitle.switch(active.file, {
      name: active.label,
      default: true,
    } as { name: string; default?: boolean });
    art.subtitle.show = true;
  } else {
    art.subtitle.show = false;
  }

  const options: TracksSubtitleOption[] = [
    {
      id: SUBTITLE_NONE_ID,
      label: SUBTITLE_NONE_LABEL,
      active: !active,
      url: '',
    },
    ...playable.map((sub) => ({
      id: sub.label.trim().toLowerCase(),
      label: sub.label,
      active: Boolean(active && sub === active),
      url: sub.file,
    })),
  ];

  patchTracksPanelModel(art, {
    subtitles: options,
    onSelectSubtitle: (id) => {
      if (id === SUBTITLE_NONE_ID) {
        art.subtitle.show = false;
        writeSubtitlePreference({ mode: 'off' });
        patchTracksPanelModel(art, {
          subtitles: options.map((item) => ({
            ...item,
            active: item.id === SUBTITLE_NONE_ID,
          })),
        });
        return;
      }
      const picked = playable.find((sub) => sub.label.trim().toLowerCase() === id);
      if (!picked) return;
      art.subtitle.switch(picked.file, { name: picked.label });
      art.subtitle.show = true;
      writeSubtitlePreference({ mode: 'on', label: picked.label });
      patchTracksPanelModel(art, {
        subtitles: options.map((item) => ({
          ...item,
          active: item.id === id,
        })),
      });
    },
  });

  return { playable, activeLabel: active?.label ?? null };
}
