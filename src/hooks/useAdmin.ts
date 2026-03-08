/**
 * Admin API hooks for Cora Cora Portal management.
 * Used by Admin/Super Admin for user management and system controls.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

// ─── Types ──────────────────────────────────

export interface AdminUser {
    id: number;
    user_id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    role_name: string;
    status: string;
    avatar_url?: string;
    phone_number?: string;
    city_ledger_limit: number | null;
    join_date?: string;
    created_at?: string;
}

export interface UpdateUserPayload {
    role_name?: string;
    department?: string;
    position?: string;
    status?: string;
    city_ledger_limit?: number | null;
    phone_number?: string;
}

export interface AdminStats {
    total_users: number;
    active_users: number;
    departments: number;
    pending_leaves: number;
}

// ─── Hooks ──────────────────────────────────

/**
 * Fetch all users for admin management.
 */
export const useAdminUsers = () => {
    return useQuery({
        queryKey: ['admin', 'users'],
        queryFn: async () => {
            const data = await api.get('/mobile/admin/users');
            return data as unknown as AdminUser[];
        },
    });
};

/**
 * Fetch admin dashboard stats.
 */
export const useAdminStats = () => {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const data = await api.get('/mobile/admin/stats');
            return data as unknown as AdminStats;
        },
    });
};

/**
 * Update a user's details (role, department, status, ledger limit, etc).
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) => {
            return api.put(`/mobile/admin/users/${userId}`, payload as unknown as Record<string, unknown>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
    });
};

/**
 * Reset a user's password (admin action).
 */
export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (userId: string) => {
            return api.post(`/mobile/admin/users/${userId}/reset-password`, {});
        },
    });
};

/**
 * Toggle a user's active/inactive status.
 */
export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
            return api.put(`/mobile/admin/users/${userId}`, { status } as unknown as Record<string, unknown>);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        },
    });
};
