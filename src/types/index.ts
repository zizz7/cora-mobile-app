/**
 * Core type definitions for Cora Cora Portal Mobile App.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  user_id: string; // Employee ID
  role_name: string; // 'Admin' | 'Super Admin' | 'HOD' | 'Employee' | 'Security'
  department: string;
  position: string;
  avatar_url: string;
  phone_number: string | null;
  notification_channel: 'email' | 'whatsapp' | 'push' | 'none';
  city_ledger_limit: number | null;
  city_ledger_notify_enabled: boolean;
  city_ledger_notify_methods: string | null; // comma-separated: 'email,whatsapp'
  // RBAC Flags
  can_log_ta_mentions?: boolean;
  transport_management?: boolean;
  can_manage_tasks?: boolean;
  gatepass_approval?: boolean;
  can_post_feed?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  user_id: string;
  password: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
