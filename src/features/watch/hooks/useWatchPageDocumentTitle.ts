import { WEBSITE_NAME } from '@/config/website';
import {
  watchDocumentTitleI18nKey,
} from '@/features/watch/lib/watch-availability';
import type { AnimeData } from '@/shared/types/animeDetailsTypes';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useWatchPageDocumentTitle(
  animeInfo: AnimeData | null,
  animeId: string
) {
  const { t } = useTranslation('common');

  useEffect(() => {
    if (animeInfo) {
      document.title = t(watchDocumentTitleI18nKey(), {
        title: animeInfo.title,
        site: WEBSITE_NAME,
      });
    }

    return () => {
      document.title = t('watch.documentTitleHome', { site: WEBSITE_NAME });
    };
  }, [animeId, animeInfo, t]);
}
