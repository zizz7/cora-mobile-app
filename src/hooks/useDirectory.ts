import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Employee {
    id: number;
    user_id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    avatar?: string;
    avatar_url?: string; // May be computed by model accessor
    phone_number?: string;
    join_date?: string;
    birth_date?: string;
    date_of_birth?: string; // Alias used in some API responses
    status?: string;
}

export interface DirectoryResponse {
    upcoming_birthdays: Employee[];
    directory: {
        data: Employee[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export const useDirectory = () => {
    return useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const data = await api.get('/mobile/directory');
            return data as unknown as DirectoryResponse;
        },
        retry: (failureCount, error: any) => {
            const status = error?.status || error?.response?.status;
            if (status === 403) return false;
            return failureCount < 2;
        },
    });
};

export const useEmployee = (userId: string) => {
    return useQuery({
        queryKey: ['employees', userId],
        queryFn: async () => {
            const response = await api.get(`/employees/${userId}`);
            // Backend wraps response in { data: employee }
            const payload = response as unknown as { data: Employee } | Employee;
            return 'data' in payload ? payload.data : payload;
        },
        enabled: !!userId,
    });
};
