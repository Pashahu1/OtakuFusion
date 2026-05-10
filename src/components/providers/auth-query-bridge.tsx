'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { favoritesQueryKey } from '@/lib/api/favorites';

export function AuthQueryBridge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: favoritesQueryKey });
    }
  }, [user, queryClient]);

  return null;
}
