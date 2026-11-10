'use client';

import { useTranslation } from 'react-i18next';

import { DiscoverBrowseHeader } from '@/components/discover/DiscoverBrowseHeader';
import { EmptyState } from '@/components/ui/states/EmptyState';

interface DiscoverBrowseI18nProps {
  sectionId: string;
  empty?: boolean;
}

export function DiscoverBrowseI18n({ sectionId, empty = false }: DiscoverBrowseI18nProps) {
  const { t } = useTranslation('common');
  const title = t(`discover.${sectionId}.title`);
  const description = t(`discover.${sectionId}.description`);

  return (
    <>
      <DiscoverBrowseHeader title={title} description={description} />
      {empty ? (
        <EmptyState title={t('discover.emptyTitle')} message={t('discover.emptyMessage', { section: title })} />
      ) : null}
    </>
  );
}
