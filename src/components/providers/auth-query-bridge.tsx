'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  bindContinueWatchingSyncLifecycle,
  hydrateContinueWatchingFromServer,
} from '@/features/watch/lib/continue-watching-sync';
import { queryKeys } from '@/lib/query/keys';

let continueWatchingLifecycleBound = false;

export function AuthQueryBridge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (continueWatchingLifecycleBound) return;
    continueWatchingLifecycleBound = true;
    bindContinueWatchingSyncLifecycle();
  }, []);

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: queryKeys.favorites });
      return;
    }
    void hydrateContinueWatchingFromServer();
  }, [user, queryClient]);

  return null;
}
