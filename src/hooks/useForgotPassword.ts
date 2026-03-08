import { useMutation } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface RequestOtpData {
    employee_id: string;
    channel: 'whatsapp' | 'email';
}

export interface ResetPasswordData {
    employee_id: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

interface AuthResponse {
    token: string;
    user: any;
    message?: string;
    status?: string;
}

export const useRequestOtp = () => {
    return useMutation({
        mutationFn: async (data: RequestOtpData) => {
            // Endpoint created in AuthController.php for mobile
            return api.post<{ status: string; message: string }>('/auth/forgot-password/request-otp', data as unknown as Record<string, unknown>);
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: ResetPasswordData) => {
            // Endpoint created in AuthController.php for mobile
            return api.post<AuthResponse>('/auth/forgot-password/reset', data as unknown as Record<string, unknown>);
        },
    });
};
