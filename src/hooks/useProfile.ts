import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiRequest } from '../utils/api';

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
            // Use apiRequest directly to avoid JSON.stringify and allow fetch to set the multipart boundary
            const data = await apiRequest<any>('/profile/photo', {
                method: 'POST',
                body: formData as any, // Cast to any because TS DOM types for fetch body might conflict with RN FormData
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        },
    });
};
