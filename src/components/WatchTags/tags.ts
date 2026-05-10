import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { TagItem } from '@/shared/types/WatchPageTypes';
import {
  faClosedCaptioning,
  faFilm,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';

export function getTags(
  animeInfo: AnimeData | null | undefined
): TagItem[] {
  if (!animeInfo) return [];
  const tv = animeInfo.animeInfo?.tvInfo;
  const episodeTotal = tv?.episodeTotal?.trim();
  const subN = tv?.has_sub;
  const dubN = tv?.has_dub;
  return [
    {
      condition: tv?.rating,
      bgColor: '#ffffff',
      text: tv?.rating,
    },
    {
      condition: animeInfo.adultContent,
      bgColor: 'red',
      text: '+18',
    },
    {
      condition: tv?.quality,
      bgColor: '#FFBADE',
      text: tv?.quality,
    },
    {
      condition: Boolean(episodeTotal),
      icon: faFilm,
      bgColor: '#E8E8E8',
      text: episodeTotal,
    },
    {
      condition: typeof subN === 'number' && subN > 0,
      icon: faClosedCaptioning,
      bgColor: '#B0E3AF',
      text: String(subN),
    },
    {
      condition: typeof dubN === 'number' && dubN > 0,
      icon: faMicrophone,
      bgColor: '#B9E7FF',
      text: String(dubN),
    },
  ];
}
