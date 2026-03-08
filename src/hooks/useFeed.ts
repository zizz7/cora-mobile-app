/**
 * React Query hooks for feed data.
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import type { FeedResponse, FeedItem, ReactionResponse, Reactor } from '../types/feed';

export interface DashboardMetrics {
  service_charge: {
    amount: string | null;
    formatted: string;
  };
  tripadvisor: {
    enabled: boolean;
    position: string | number | null;
    total: string | number | null;
    string: string | null;
  };
  approvals: {
    pending: number;
  };
}

const FEED_PAGE_SIZE = 15;

/**
 * Fetch a single page of the unified feed.
 */
async function fetchFeedPage(page: number): Promise<FeedResponse> {
  return api.get<FeedResponse>(`/feed?page=${page}&per_page=${FEED_PAGE_SIZE}`);
}

/**
 * Infinite scroll hook for the feed.
 */
export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => fetchFeedPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });
}

/**
 * Fetch home screen dashboard metrics (Service Charge, TripAdvisor Ranking, pending Approvals)
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => api.get<DashboardMetrics>('/mobile/dashboard/metrics'),
  });
}

/**
 * Fetch a single feed item.
 */
export function useFeedItem(id: string) {
  return useQuery({
    queryKey: ['feed', id],
    queryFn: () => api.get<{ data: FeedItem }>(`/feed/${id}`),
    enabled: !!id,
  });
}

/**
 * Toggle reaction on a feed item.
 */
export function useReactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => api.post<ReactionResponse>(`/feed/${itemId}/react`, {}),
    onMutate: async (itemId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(['feed']);

      // Optimistically update
      queryClient.setQueryData(['feed'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: FeedResponse) => ({
            ...page,
            data: page.data.map((item: FeedItem) =>
              item.id === itemId
                ? {
                  ...item,
                  has_reacted: !item.has_reacted,
                  reactions_count: item.has_reacted
                    ? item.reactions_count - 1
                    : item.reactions_count + 1,
                }
                : item
            ),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (_err, _itemId, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['feed'], context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/**
 * Fetch reactors for a feed item.
 */
export function useReactors(itemId: string) {
  return useQuery({
    queryKey: ['feed', itemId, 'reactors'],
    queryFn: () => api.get<{ data: Reactor[] }>(`/feed/${itemId}/reactors`),
    enabled: !!itemId,
  });
}
