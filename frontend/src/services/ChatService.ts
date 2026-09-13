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

        let message = "Failed to get response from server.";

        try {
            const errorData = await response.json();

            if (errorData.response) {
                message = errorData.response;
            } else if (errorData.message) {
                message = errorData.message;
            }
        } catch {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return response.json();
}