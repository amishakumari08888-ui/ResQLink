const API_BASE_URL = "http://localhost:8080";

export interface FeedbackData {
    userId: string;
    userEmail?: string;
    rating: number;
    review?: string;
    triggerReason?: string; // "LIMIT_REACHED" | "THREE_CONVERSATIONS" | "MANUAL"
}

export interface UsageStatusResponse {
    promptsUsed: number;
    promptLimit: number;
    inputTokensUsed: number;
    inputTokenLimit: number;
}

export async function submitFeedbackApi(data: FeedbackData): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to submit feedback. Please try again.");
    }

    return response.json();
}

export async function fetchUsageStatus(userId: string): Promise<UsageStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat/usage?userId=${encodeURIComponent(userId)}`);
    if (!response.ok) {
        throw new Error("Failed to fetch usage status.");
    }
    return response.json();
}
