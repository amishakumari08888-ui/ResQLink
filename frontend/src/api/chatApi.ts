import { API_BASE_URL } from "../utils/constants";

export interface ChatRequest {
    message: string;
    conversationId?: string;
    image?: string;
    userId?: string;
}

export interface ChatResponse {
    response: string;
    conversationId: string;
    tokensUsed: number;
}

export async function sendMessage(
    request: ChatRequest
): Promise<ChatResponse> {

    const response = await fetch(
        `${API_BASE_URL}/api/chat/message`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
            errorText || "Failed to get response from server."
        );
    }

    return response.json();
}