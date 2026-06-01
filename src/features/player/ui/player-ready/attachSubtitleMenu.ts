import type Artplayer from 'artplayer';
import { captionIcon } from '../PlayerIcons';
import { resolveAssetPlaybackUrl } from '../playerStream';
import type { SubtitleItem } from '@/shared/types/PlayerTypes';
import {
  readSubtitlePreference,
  writeSubtitlePreference,
} from '../playerPlaybackPreferences';

export function attachSubtitleMenu(
  art: Artplayer,
  subtitles: SubtitleItem[] | null,
  streamLang: 'sub' | 'dub' | null,
  assetRequestHeaders: Record<string, string>
): void {
  art.subtitle.style({
    fontSize: (art.width > 500 ? art.width * 0.02 : art.width * 0.03) + 'px',
  });

  const playableSubtitles = (subtitles ?? [])
    .map((sub) => ({
      ...sub,
      file: resolveAssetPlaybackUrl(sub.file, assetRequestHeaders),
    }))
    .filter((sub) => sub.file.trim().length > 0);

  const defaultEnglishSub =
    playableSubtitles.find(
      (sub) => sub.label.toLowerCase().includes('english') && sub.default
    ) ||
    playableSubtitles.find((sub) => sub.label.toLowerCase().includes('english'));

  const subPref = readSubtitlePreference();
  const streamWantsSub = streamLang !== 'dub';
  let shouldShowSub = streamWantsSub;
  if (subPref?.mode === 'off') shouldShowSub = false;
  if (subPref?.mode === 'on') shouldShowSub = true;

  let defaultSubtitle: (typeof playableSubtitles)[0] | null = null;
  if (shouldShowSub) {
    if (subPref?.mode === 'on' && subPref.label.trim()) {
      const match = playableSubtitles.find(
        (s) => s.label.trim().toLowerCase() === subPref.label.trim().toLowerCase()
      );
      defaultSubtitle = match ?? defaultEnglishSub ?? playableSubtitles[0] ?? null;
    } else {
      defaultSubtitle = defaultEnglishSub ?? playableSubtitles[0] ?? null;
    }
  }

  if (playableSubtitles.length > 0) {
    art.setting.add({
      name: 'captions',
      icon: captionIcon,
      html: 'Subtitle',
      tooltip: defaultSubtitle?.label ?? 'None',
      position: 'right',
      selector: [
        {
          html: 'Display',
          switch: shouldShowSub && Boolean(defaultSubtitle),
          onSwitch: function (item) {
            const isEnabled = Boolean(item.switch);
            item.tooltip = isEnabled ? 'Hide' : 'Show';
            art.subtitle.show = isEnabled;
            if (!isEnabled) writeSubtitlePreference({ mode: 'off' });
            return isEnabled;
          },
        },
        {
          html: 'None',
          default: !defaultSubtitle,
          url: '',
        },
        ...playableSubtitles.map((sub) => ({
          default: Boolean(defaultSubtitle && sub === defaultSubtitle),
          html: sub.label,
          url: sub.file,
        })),
      ],
      onSelect: function (item: { html?: string; url?: string }) {
        if (!item.url?.trim()) {
          art.subtitle.show = false;
          writeSubtitlePreference({ mode: 'off' });
          return item.html ?? 'None';
        }
        const label = item.html?.trim() ?? 'Subtitle';
        art.subtitle.switch(item.url, { name: label });
        art.subtitle.show = true;
        writeSubtitlePreference({ mode: 'on', label });
        return label;
      },
    });
  }

  if (defaultSubtitle) {
    art.subtitle.switch(defaultSubtitle.file, {
      name: defaultSubtitle.label,
      default: true,
    } as { name: string; default?: boolean });
    art.subtitle.show = true;
  } else {
    art.subtitle.show = false;
  }
}
