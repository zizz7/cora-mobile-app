import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Mention {
    id: number;
    employee_name: string;
    department: string;
    review_date: string;
    review_text: string;
    source: string;
    rating: number;
    created_at: string;
}

export const useMentions = () => {
    return useQuery({
        queryKey: ['mentions'],
        queryFn: async () => {
            const { data } = await api.get<any>('/mentions');
            return data as Mention[];
        },
    });
};

export const useTranslate = () => {
    return useMutation({
        mutationFn: async (text: string) => {
            const response = await api.post<any>('/feed/translate', { text });
            return response;
        },
    });
};
