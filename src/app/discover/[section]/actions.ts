'use server';

import {
  getDiscoverBrowsePage,
  type DiscoverBrowseResult,
} from '@/lib/api/discover';

export async function loadDiscoverBrowsePage(input: {
  sectionId: string;
  page: number;
}): Promise<DiscoverBrowseResult | null> {
  return getDiscoverBrowsePage({
    sectionId: input.sectionId,
    page: input.page,
  });
}
