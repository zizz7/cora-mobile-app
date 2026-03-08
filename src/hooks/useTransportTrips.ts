import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface TransportTrip {
    id: number;
    date: string;
    route: string;
    departure: string;
    arrival: string;
    engineHours: number;
    fuelLiters: number;
    fuelCost: number;
    fuelCostPerLiter: number;
    rpm: number;
    guests: number;
    staff: number;
    department: string;
    remarks: string;
    createdAt: string;
}

export interface TransportRefuel {
    id: number;
    date: string;
    requestedAmount: number;
    actualAmount: number;
    amount: number;
    remarks: string;
    createdAt: string;
}

export interface TransportLogResponse {
    success: boolean;
    month: string;
    locked: boolean;
    openingFuel: number;
    currentFuel: number;
    trips: TransportTrip[];
    refuels: TransportRefuel[];
    availableMonths: string[];
    totals: {
        trips: number;
        fuel: number;
        cost: number;
        guests: number;
        staff: number;
        refueled: number;
    };
}

export const useTransportLog = (month?: string) => {
    return useQuery({
        queryKey: ['transport-log', month],
        queryFn: async () => {
            const url = month ? `/mobile/transport/log?month=${month}` : '/mobile/transport/log';
            const data = await api.get<TransportLogResponse>(url);
            return data;
        },
    });
};

export const useAddTransportTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tripData: any) => {
            const data = await api.post<any>('/mobile/transport/trips', tripData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transport-log'] });
        },
    });
};
