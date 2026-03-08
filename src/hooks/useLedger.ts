import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface LedgerTransaction {
    id: number;
    staff_id: string;
    month: string;
    posted_at: string;
    check_num: string | null;
    amount: number;
    outlet: string;
    items: string[] | null;
    receipt_text: string | null;
}

export interface LedgerSettings {
    limit: number | null;
    notify_enabled: boolean;
    notify_methods: string | null;
}

export interface LedgerMonthOption {
    value: string; // e.g., "2026-02"
    label: string; // e.g., "February 2026"
}

export interface LedgerData {
    credit_limit: number;
    current_balance: number;
    active_month: string;
    billing_cycle: string;
    period_start: string;
    period_end: string;
    staff_id: string;
    transactions: LedgerTransaction[];
    available_months: LedgerMonthOption[];
    limit_settings: LedgerSettings;
}

export const useLedger = (month?: string) => {
    return useQuery({
        queryKey: ['city-ledger', month],
        queryFn: async (): Promise<LedgerData> => {
            const url = month ? `/mobile/city-ledger?month=${month}` : '/mobile/city-ledger';
            const response = await api.get<any>(url);
            const payload = response?.data ?? response;
            return {
                credit_limit: Number(payload?.credit_limit ?? 0),
                current_balance: Number(payload?.current_balance ?? 0),
                active_month: payload?.active_month ?? '',
                billing_cycle: payload?.billing_cycle ?? 'Current Cycle',
                period_start: payload?.period_start ?? '',
                period_end: payload?.period_end ?? '',
                staff_id: payload?.staff_id ?? '',
                transactions: Array.isArray(payload?.transactions) ? payload.transactions : [],
                available_months: Array.isArray(payload?.available_months) ? payload.available_months : [],
                limit_settings: payload?.limit_settings ?? {
                    limit: null,
                    notify_enabled: false,
                    notify_methods: null,
                },
            };
        },
        retry: 2,
        staleTime: 60_000,
    });
};

export const useSaveLedgerSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (settings: {
            limit: number | null;
            notify_enabled: boolean;
            notify_methods: string;
        }) => {
            const response = await api.post<any>('/mobile/city-ledger/settings', settings);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['city-ledger'] });
        },
    });
};
