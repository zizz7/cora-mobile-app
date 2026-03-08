import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface CalendarActivity {
    id: number;
    activity_name: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    type: string;
}

export const useCalendar = () => {
    return useQuery({
        queryKey: ['calendar'],
        queryFn: async () => {
            const { data } = await api.get<any>('/mobile/calendar');
            return data as CalendarActivity[];
        },
    });
};
