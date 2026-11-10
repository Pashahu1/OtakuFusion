import { getGenreBrowsePage } from '@/lib/api/genre-hub';
import { GenreBrowseFilters } from '@/components/genre-hub/GenreBrowseFilters';
import { GenreBrowseLoadMore } from '@/components/genre-hub/GenreBrowseLoadMore';
import { I18nEmpty } from '@/components/ui/states/I18nEmpty';
import { ErrorState } from '@/components/ui/states/ErrorState';
import {
  getGenreSectionConfig,
  type GenreMediaFilter,
} from '@/shared/data/genre-hub';

interface GenreBrowseContentProps {
  genre: string;
  sectionId: string;
  media: GenreMediaFilter;
}

export async function GenreBrowseContent({
  genre,
  sectionId,
  media,
}: GenreBrowseContentProps) {
  const section = getGenreSectionConfig(sectionId);
  if (!section) return null;

  let result;
  try {
    result = await getGenreBrowsePage({
      genre,
      sectionId,
      media,
      page: 1,
    });
  } catch {
    return <ErrorState />;
  }

  if (!result || result.items.length === 0) {
    return (
      <div className="genre-browse-layout">
        <GenreBrowseFilters
          genre={genre}
          sectionId={sectionId}
          sectionLabel={section.label}
          media={media}
        />
        <I18nEmpty
          titleKey="genreHub.noTitles"
          messageKey="genreHub.noSectionHint"
          values={{ genre }}
          tValues={{
            genre: `genreNames.${genre}`,
            section: `genreHub.${sectionId}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="genre-browse-layout">
      <GenreBrowseFilters
        genre={genre}
        sectionId={sectionId}
        sectionLabel={section.label}
        media={media}
      />
      <GenreBrowseLoadMore
        genre={genre}
        sectionId={sectionId}
        media={media}
        initialItems={result.items}
        initialPage={result.page}
        hasNextPage={result.hasNextPage}
      />
    </div>
  );
}
