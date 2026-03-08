/**
 * Hook for creating feed posts.
 * Uses multipart/form-data to support image uploads.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../utils/api';

export interface CreatePostPayload {
    body?: string;
    media?: { uri: string; name: string; type: string }[];
    youtube_url?: string;
}

async function createFeedPost(payload: CreatePostPayload) {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();

    if (payload.body) {
        formData.append('body', payload.body);
    }

    if (payload.youtube_url) {
        formData.append('youtube_url', payload.youtube_url);
    }

    if (payload.media && payload.media.length > 0) {
        payload.media.forEach((file) => {
            formData.append('media[]', {
                uri: file.uri,
                name: file.name,
                type: file.type,
            } as any);
        });
    }

    const response = await fetch(`${API_BASE_URL}/feed/posts`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create post');
    }

    return response.json();
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createFeedPost,
        onSuccess: () => {
            // Invalidate the feed to show the new post
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        },
    });
}
