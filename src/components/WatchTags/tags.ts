import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import type { TagItem } from '@/shared/types/WatchPageTypes';
import {
  faClosedCaptioning,
  faMicrophone,
} from '@fortawesome/free-solid-svg-icons';

export function getTags(
  animeInfo: AnimeData | null | undefined
): TagItem[] {
  if (!animeInfo) return [];
  return [
    {
      condition: animeInfo?.animeInfo?.tvInfo?.rating,
      bgColor: '#ffffff',
      text: animeInfo?.animeInfo?.tvInfo?.rating,
    },
    {
      condition: animeInfo?.adultContent,
      bgColor: 'red',
      text: '+18',
    },
    {
      condition: animeInfo?.animeInfo?.tvInfo?.quality,
      bgColor: '#FFBADE',
      text: animeInfo?.animeInfo?.tvInfo?.quality,
    },
    {
      condition: animeInfo?.animeInfo?.tvInfo?.sub,
      icon: faClosedCaptioning,
      bgColor: '#B0E3AF',
      text: animeInfo?.animeInfo?.tvInfo?.sub,
    },
    {
      condition: animeInfo?.animeInfo?.tvInfo?.dub,
      icon: faMicrophone,
      bgColor: '#B9E7FF',
      text: animeInfo?.animeInfo?.tvInfo?.dub,
    },
  ];
}
