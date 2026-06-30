import { trpc } from '../lib/trpc';

export function useAuth() {
  const { data, isLoading, refetch } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: data?.user ?? null,
    church: data?.church ?? null,
    isLoading,
    refetch,
    isAuthenticated: !!data?.user,
  };
}
