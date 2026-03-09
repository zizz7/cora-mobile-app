import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { phone_number?: string; notification_channel?: string }) => {
            const { data } = await api.put<any>('/profile', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
};

export const useUpdateProfilePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
    mutationFn: async (formData: FormData) => {
            const data = await api.upload<any>('/profile/photo', formData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
};
