import { Suspense } from 'react';
import { GenreHubContent } from './_components/GenreHubContent';
import { GenreHubSkeleton } from './_components/GenreHubSkeleton';

export default async function GenreHubPage({
  params,
}: {
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;

  return (
    <Suspense key={gender} fallback={<GenreHubSkeleton />}>
      <GenreHubContent slug={gender} />
    </Suspense>
  );
}
