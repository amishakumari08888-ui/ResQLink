import { type Message } from "./Message";

export interface Conversation {
    id: string;
    backendConversationId?: string;
    title: string;
    messages: Message[];
    createdAt: string;
}

export type AiModel = "nexcure-3.4" | "doctor-triage" | "emergency-fast";