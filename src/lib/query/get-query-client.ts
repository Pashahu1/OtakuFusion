import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
      },
    },
  });
}

/** Server: one client per request. Client components use QueryProvider instead. */
export const getQueryClient = cache(() => makeQueryClient());
