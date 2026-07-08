'use client';

import { useParams } from 'next/navigation';
import { parseRouteParam } from '@/shared/utils/parse-route-param';

/** Reads `/watch/[id]` segment as a normalized string. */
export function useRouteAnimeId(): string {
  const params = useParams();
  return parseRouteParam(params?.id);
}