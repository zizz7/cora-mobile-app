/**
 * React Query hooks for Gate Pass data.
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface GatePassItem {
  id?: number;
  gatepass_id?: number;
  item_description: string;
  quantity: number;
  unit: string;
  serial_number?: string | null;
  reason: string;
  estimated_return_date: string;
}

export interface GatePass {
  gatepass_id: number;
  gatepass_number: string;
  gatepass_date: string;
  reference_type: 'PO Number' | 'Reference Number';
  reference_value: string;
  prepared_by_user_id: string;
  prepared_by_name: string;
  prepared_by_department: string;
  prepared_by_contact: string;
  supplier_business_name: string;
  supplier_contact: string;
  supplier_contact_person: string;
  total_packages: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Completed';
  current_approval_step: string;
  rejection_reason?: string | null;
  created_at: string;
  items?: GatePassItem[];
  approvals?: any[];
}

interface GatePassResponse {
  data: GatePass[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface CreateGatePassData {
  reference_type: 'PO Number' | 'Reference Number';
  reference_value: string;
  supplier_business_name: string;
  supplier_contact: string;
  supplier_contact_person: string;
  total_packages: number;
  items: GatePassItem[];
}

/**
 * List gate passes with infinite scroll.
 */
export function useGatePasses() {
  return useInfiniteQuery({
    queryKey: ['gate-passes'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<GatePassResponse>(`/gate-passes?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });
}

/**
 * List pending gate pass approvals.
 */
export function usePendingGatePasses() {
  return useInfiniteQuery({
    queryKey: ['gate-passes', 'pending'],
    queryFn: ({ pageParam = 1 }) =>
      api.get<GatePassResponse>(`/gate-passes/pending?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });
}

/**
 * Get single gate pass.
 */
export function useGatePass(id: number) {
  return useQuery({
    queryKey: ['gate-passes', id],
    queryFn: () => api.get<{ data: GatePass; can_approve: boolean; user_approval_step: string }>(`/gate-passes/${id}`),
    enabled: !!id,
  });
}

/**
 * Create new gate pass.
 */
export function useCreateGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGatePassData) =>
      api.post<{ message: string; data: GatePass }>('/gate-passes', data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate-passes'] });
    },
  });
}

/**
 * Approve/Reject gate pass.
 */
export function useApproveGatePass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      action,
      remarks,
      rejection_reason,
    }: {
      id: number;
      action: 'approve' | 'reject';
      remarks?: string;
      rejection_reason?: string;
    }) => {
      const endpoint = action === 'approve' ? `/gate-passes/${id}/approve` : `/gate-passes/${id}/reject`;
      const payload = action === 'approve' ? { remarks } : { rejection_reason };
      return api.post<{ message: string; data: GatePass }>(endpoint, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gate-passes'] });
      queryClient.invalidateQueries({ queryKey: ['gate-passes', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['gate-passes', variables.id] });
    },
  });
}

/**
 * Get units list
 */
export function useUnits() {
  return useQuery({
    queryKey: ['gate-passes', 'units'],
    queryFn: () => api.get<string[]>('/gate-passes/units'),
  });
}
