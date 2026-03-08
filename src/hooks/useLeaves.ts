import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface LeaveRequest {
    id: number;
    leave_type: string;
    from_date: string;
    to_date: string;
    day: number;
    leave_reason: string;
    hr_status?: string;
    hod_status?: string;
    created_at: string;
}

export const useLeaves = () => {
    return useQuery({
        queryKey: ['leaves'],
        queryFn: async () => {
            const { data } = await api.get<any>('/leaves');
            return data as LeaveRequest[];
        },
    });
};

export const useSubmitLeave = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<LeaveRequest>) => {
            const response = await api.post<any>('/leaves', payload);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        },
    });
};
