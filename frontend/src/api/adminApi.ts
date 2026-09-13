import { API_BASE_URL } from "../utils/constants";

export interface AdminStats {
    totalUsers: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalPrompts: number;
    totalConversations: number;
    todayUsersActive: number;
    todayTokens: number;
    todayInputTokens: number;
    todayOutputTokens: number;
    todayPrompts: number;
    aiModel: string;
}

export interface AdminUser {
    id: number;
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
    photoUrl: string | null;
    authProvider: string | null;
    createdAt: string;
    lastLoginAt: string;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    totalPrompts: number;
    todayPrompts: number;
    todayTokens: number;
    conversationCount: number;
}

export interface DailyUsage {
    date: string;
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    promptCount: number;
    activeUsers: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
    if (!res.ok) {
        throw new Error(`Failed to load admin stats: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`);
    if (!res.ok) {
        throw new Error(`Failed to load admin users: ${res.statusText}`);
    }
    return res.json();
}

export async function fetchDailyUsage(days = 7): Promise<DailyUsage[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/daily-usage?days=${days}`);
    if (!res.ok) {
        throw new Error(`Failed to load daily usage: ${res.statusText}`);
    }
    return res.json();
}
