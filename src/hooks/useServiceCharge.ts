import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface ServiceCharge {
    id: number;
    month: string; // e.g. "2026-02"
    amount: number | string;
    currency: string;
    notes?: string;
    created_by?: number;
    updated_by?: number;
}

export const useServiceCharge = () => {
    return useQuery({
        queryKey: ['service-charge'],
        queryFn: async () => {
            const response = await api.get<any>('/mobile/service-charge');
            return response as ServiceCharge[];
        },
    });
};
