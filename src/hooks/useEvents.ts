import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Event {
    event_id: number;
    event_name: string;
    event_type: string;
    event_description: string;
    event_date: string;
    event_time: string;
    location: string;
    max_participants: number;
    current_participants: number;
    mode: string;
    creator?: {
        name: string;
        department: string;
    };
    participants?: {
        user: {
            id: number;
            name: string;
            avatar?: string;
        };
    }[];
}

export const useEvents = () => {
    return useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data } = await api.get<any>('/events');
            return data as Event[];
        },
    });
};

export const useEvent = (id: number) => {
    return useQuery({
        queryKey: ['events', id],
        queryFn: async () => {
            const { data } = await api.get<any>(`/events/${id}`);
            return data as Event;
        },
        enabled: !!id,
    });
};

export const useRsvpEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.post<any>(`/events/${id}/rsvp`, {});
            return response;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['events', id] });
        },
    });
};
