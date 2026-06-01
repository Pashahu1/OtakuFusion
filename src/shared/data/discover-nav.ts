export interface DiscoverSectionConfig {
  id: string;
  label: string;
  href: string;
  description: string;
  sort: string[];
  status?: string;
  format?: string;
}

export const DISCOVER_NAV_SECTIONS: DiscoverSectionConfig[] = [
  {
    id: 'new',
    label: 'New',
    href: '/discover/new',
    description: 'Recently started series and fresh releases on AniList.',
    sort: ['START_DATE_DESC'],
  },
  {
    id: 'popular',
    label: 'Popular',
    href: '/discover/popular',
    description: 'What everyone is watching — ranked by popularity on AniList.',
    sort: ['POPULARITY_DESC'],
  },
  {
    id: 'simulcast',
    label: 'Simulcast',
    href: '/discover/simulcast',
    description: 'Currently airing shows — catch up with the season.',
    sort: ['POPULARITY_DESC'],
    status: 'RELEASING',
  },
];

export function getDiscoverSection(id: string): DiscoverSectionConfig | undefined {
  return DISCOVER_NAV_SECTIONS.find((s) => s.id === id);
}

export function isDiscoverSection(id: string): boolean {
  return DISCOVER_NAV_SECTIONS.some((s) => s.id === id);
}
