import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Trip {
    trip_id: number;
    trip_name: string;
    trip_description: string;
    departure_date: string;
    departure_time: string;
    return_date: string;
    return_time: string;
    departure_location: string;
    max_participants: number;
    current_participants: number;
    trip_status: string;
    visibility?: string;
    target_department?: string | null;
    public_token?: string | null;
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

export const useTrips = () => {
    return useQuery({
        queryKey: ['trips'],
        queryFn: async () => {
            const { data } = await api.get<any>('/trips');
            return data as Trip[];
        },
    });
};

export const useTrip = (id: number) => {
    return useQuery({
        queryKey: ['trips', id],
        queryFn: async () => {
            const { data } = await api.get<any>(`/trips/${id}`);
            return data as Trip;
        },
        enabled: !!id,
    });
};

export const useJoinTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.post<any>(`/trips/${id}/join`, {});
            return response;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            queryClient.invalidateQueries({ queryKey: ['trips', id] });
        },
    });
};

export const useCreateTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tripData: any) => {
            const { data } = await api.post<any>('/trips', tripData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
};
