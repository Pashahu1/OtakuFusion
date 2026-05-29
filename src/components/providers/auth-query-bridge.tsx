'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '@/lib/query/keys';

export function AuthQueryBridge() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: queryKeys.favorites });
    }
  }, [user, queryClient]);

  return null;
}
