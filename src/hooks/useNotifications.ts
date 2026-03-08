import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface NotificationItem {
    id: number;
    type: string;
    data: any;
    read_at: string | null;
    created_at: string;
}

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const data = await api.get('/notifications');
            return data as unknown as NotificationItem[];
        },
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: async () => {
            const data = await api.get('/notifications/unread-count');
            return data as unknown as { count: number };
        },
        refetchInterval: 60000, // Poll every minute
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const data = await api.post(`/notifications/${id}/read`, {});
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};

export const useMarkAllRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const data = await api.post('/notifications/read-all', {});
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
