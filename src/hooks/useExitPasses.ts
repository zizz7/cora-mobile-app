/**
 * React Query hooks for Exit Pass data.
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

interface ExitPass {
  id: number;
  departure_date: string;
  return_date: string;
  location: string;
  mode_of_departure: 'Seaplane/Domestic' | 'Boat';
  leave_type: 'Annual Leave' | 'Off Day' | 'R&R' | 'Emergency' | 'Business Leave' | 'Other Leave';
  hod_status: string;
  hr_status: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reject_reason: string | null;
  departure_status: string | null;
  created_at: string;
  user: {
    name: string;
    user_id: string;
    department: string;
  };
}

interface ExitPassResponse {
  data: ExitPass[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface CreateExitPassData {
  depature_date: string;
  return_date: string;
  location: string;
  mode_of_departure: 'Seaplane/Domestic' | 'Boat';
  leave_type: 'Annual Leave' | 'Off Day' | 'R&R' | 'Emergency' | 'Business Leave' | 'Other Leave';
  reason?: string;
}

/**
 * List exit passes with infinite scroll.
 */
export function useExitPasses() {
  return useInfiniteQuery({
    queryKey: ['exit-passes'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<ExitPassResponse>(`/exit-passes?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });
}

/**
 * Get single exit pass.
 */
export function useExitPass(id: number) {
  return useQuery({
    queryKey: ['exit-passes', id],
    queryFn: () => api.get<{ data: ExitPass }>(`/exit-passes/${id}`),
    enabled: !!id,
  });
}

/**
 * Create new exit pass.
 */
export function useCreateExitPass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExitPassData) =>
      api.post<{ message: string; data: ExitPass }>('/exit-passes', data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exit-passes'] });
    },
  });
}

/**
 * Approve/Reject exit pass.
 */
export function useApproveExitPass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      level,
      reason,
    }: {
      id: number;
      action: 'approve' | 'reject';
      level: 'hod' | 'hr';
      reason?: string;
    }) => {
      const endpoint =
        action === 'approve'
          ? `/exit-passes/${id}/${level}-approve`
          : `/exit-passes/${id}/${level}-reject`;
      return api.post<{ message: string; data: ExitPass }>(
        endpoint,
        reason ? { reason } : {}
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exit-passes'] });
      queryClient.invalidateQueries({ queryKey: ['exit-passes', variables.id] });
    },
  });
}

/**
 * Security check-in/check-out.
 */
export function useSecurityCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'departed' | 'returned' }) =>
      api.post<{ message: string; data: ExitPass }>(`/exit-passes/${id}/security-check`, {
        action,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exit-passes'] });
      queryClient.invalidateQueries({ queryKey: ['exit-passes', variables.id] });
    },
  });
}
