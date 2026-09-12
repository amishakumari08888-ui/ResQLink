import { create } from "zustand";
import { type Message } from "../types/Message";
import { type Conversation, type AiModel } from "../types/Chat";
import { sendMessage as apiSendMessage } from "../services/ChatService";
import { useAuthStore } from "./authStore";

interface ChatStore {
    conversations: Conversation[];
    activeConversationId: string | null;
    isSidebarOpen: boolean;
    selectedModel: AiModel;
    loading: boolean;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSelectedModel: (model: AiModel) => void;
    createNewChat: () => string;
    selectChat: (id: string) => void;
    deleteChat: (id: string) => void;
    clearCurrentChat: () => void;
    send: (messageText: string, image?: string) => Promise<void>;
    regenerateLastResponse: () => Promise<void>;

    // Feedback Modal
    isFeedbackModalOpen: boolean;
    feedbackTriggerReason: "LIMIT_REACHED" | "THREE_CONVERSATIONS" | "MANUAL";
    openFeedbackModal: (reason?: "LIMIT_REACHED" | "THREE_CONVERSATIONS" | "MANUAL") => void;
    closeFeedbackModal: () => void;

    // Admin Panel
    isAdminOpen: boolean;
    openAdmin: () => void;
    closeAdmin: () => void;
}

const STORAGE_KEY = "nexcure_chat_sessions_v1";

const loadInitialConversations = (): Conversation[] => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch {
        // Fallback
    }
    return [];
};

const saveConversations = (conversations: Conversation[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
        // Ignore storage errors
    }
};

export const useChatStore = create<ChatStore>((set, get) => {
    const initialConversations = loadInitialConversations();
    const initialActiveId = initialConversations.length > 0 ? initialConversations[0].id : null;

    return {
        conversations: initialConversations,
        activeConversationId: initialActiveId,
        isSidebarOpen: true,
        selectedModel: "nexcure-3.4",
        loading: false,

        // Feedback Modal State
        isFeedbackModalOpen: false,
        feedbackTriggerReason: "MANUAL",
        openFeedbackModal: (reason = "MANUAL") => set({ isFeedbackModalOpen: true, feedbackTriggerReason: reason }),
        closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),

        // Admin Panel State
        isAdminOpen: typeof window !== "undefined" && window.location.hash === "#admin",
        openAdmin: () => {
            if (typeof window !== "undefined") window.location.hash = "#admin";
            set({ isAdminOpen: true });
        },
        closeAdmin: () => {
            if (typeof window !== "undefined" && window.location.hash === "#admin") {
                history.replaceState(null, "", " ");
            }
            set({ isAdminOpen: false });
        },

        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
        setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),
        setSelectedModel: (model: AiModel) => set({ selectedModel: model }),

        createNewChat: () => {
            const newId = crypto.randomUUID();
            const newConv: Conversation = {
                id: newId,
                title: "New Conversation",
                messages: [],
                createdAt: new Date().toISOString(),
            };

            const currentConvs = get().conversations;
            const activeConvsCount = currentConvs.filter((c) => c.messages.length > 0).length;
            const feedbackAlreadyShown = localStorage.getItem("nexcure_feedback_3conv_shown");
            const feedbackAlreadyGiven = localStorage.getItem("nexcure_feedback_given_v1");

            if (activeConvsCount >= 3 && !feedbackAlreadyShown && !feedbackAlreadyGiven) {
                localStorage.setItem("nexcure_feedback_3conv_shown", "true");
                setTimeout(() => {
                    set({ isFeedbackModalOpen: true, feedbackTriggerReason: "THREE_CONVERSATIONS" });
                }, 600);
            }

            set((state) => {
                const updated = [newConv, ...state.conversations];
                saveConversations(updated);
                return {
                    conversations: updated,
                    activeConversationId: newId,
                };
            });

            return newId;
        },

        selectChat: (id: string) => set({ activeConversationId: id }),

        deleteChat: (id: string) => {
            set((state) => {
                const updated = state.conversations.filter((c) => c.id !== id);
                saveConversations(updated);
                const nextActiveId = state.activeConversationId === id
                    ? (updated.length > 0 ? updated[0].id : null)
                    : state.activeConversationId;

                return {
                    conversations: updated,
                    activeConversationId: nextActiveId,
                };
            });
        },

        clearCurrentChat: () => {
            const { activeConversationId } = get();
            if (!activeConversationId) return;

            set((state) => {
                const updated = state.conversations.map((c) => {
                    if (c.id === activeConversationId) {
                        return { ...c, messages: [] };
                    }
                    return c;
                });
                saveConversations(updated);
                return { conversations: updated };
            });
        },

        send: async (messageText: string, image?: string) => {
            const hasText = Boolean(messageText && messageText.trim());
            const hasImage = Boolean(image);
            if (!hasText && !hasImage) return;

            let { activeConversationId, conversations } = get();

            // Auto-create chat if none active
            if (!activeConversationId || !conversations.some((c) => c.id === activeConversationId)) {
                activeConversationId = get().createNewChat();
                conversations = get().conversations;
            }

            const currentConv = conversations.find((c) => c.id === activeConversationId);
            const isFirstMessage = !currentConv || currentConv.messages.length === 0;

            const trimmedText = messageText ? messageText.trim() : "";
            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: "user",
                content: trimmedText,
                image: image,
                timestamp: new Date(),
            };

            // Derive a title from first message
            const titleSource = trimmedText || (hasImage ? "Medical Image Analysis" : "New Conversation");
            const derivedTitle = isFirstMessage
                ? (titleSource.length > 30 ? titleSource.slice(0, 30) + "..." : titleSource)
                : (currentConv?.title || "New Conversation");

            // Optimistically update user message
            set((state) => {
                const updated = state.conversations.map((c) => {
                    if (c.id === activeConversationId) {
                        return {
                            ...c,
                            title: derivedTitle,
                            messages: [...c.messages, userMessage],
                        };
                    }
                    return c;
                });
                saveConversations(updated);
                return { conversations: updated, loading: true };
            });

            const authUser = useAuthStore.getState().user;
            if (!authUser || !authUser.uid) {
                useAuthStore.getState().openAuthModal();
                return;
            }

            const currentUserId = authUser.uid;

            try {
                const backendConvId = currentConv?.backendConversationId;
                const response = await apiSendMessage({
                    message: trimmedText || "Please review and analyze this attached medical image / symptom.",
                    conversationId: backendConvId,
                    image: image,
                    userId: currentUserId,
                });

                const aiMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: response.response,
                    timestamp: new Date(),
                };

                set((state) => {
                    const updated = state.conversations.map((c) => {
                        if (c.id === activeConversationId) {
                            return {
                                ...c,
                                backendConversationId: response.conversationId || c.backendConversationId,
                                messages: [...c.messages, aiMessage],
                            };
                        }
                        return c;
                    });
                    saveConversations(updated);
                    return { conversations: updated, loading: false };
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Something went wrong.";
                const isLimitReached = errorMessage.toLowerCase().includes("limit") || errorMessage.includes("429") || errorMessage.includes("1,200") || errorMessage.includes("8 prompt");

                if (isLimitReached) {
                    setTimeout(() => {
                        set({ isFeedbackModalOpen: true, feedbackTriggerReason: "LIMIT_REACHED" });
                    }, 500);
                }

                const errorAiMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `⚠️ ${errorMessage}`,
                    timestamp: new Date(),
                };

                set((state) => {
                    const updated = state.conversations.map((c) => {
                        if (c.id === activeConversationId) {
                            return {
                                ...c,
                                messages: [...c.messages, errorAiMessage],
                            };
                        }
                        return c;
                    });
                    saveConversations(updated);
                    return { conversations: updated, loading: false };
                });
            }
        },

        regenerateLastResponse: async () => {
            const { activeConversationId, conversations, loading } = get();
            if (loading || !activeConversationId) return;

            const conv = conversations.find((c) => c.id === activeConversationId);
            if (!conv || conv.messages.length === 0) return;

            // Find last user message
            const lastUserMsg = [...conv.messages].reverse().find((m) => m.role === "user");
            if (!lastUserMsg) return;

            // Remove last assistant message if present
            const updatedMessages = conv.messages.filter((m, i) => {
                if (i === conv.messages.length - 1 && m.role === "assistant") {
                    return false;
                }
                return true;
            });

            set((state) => {
                const updated = state.conversations.map((c) => {
                    if (c.id === activeConversationId) {
                        return { ...c, messages: updatedMessages };
                    }
                    return c;
                });
                saveConversations(updated);
                return { conversations: updated, loading: true };
            });

            const authUser = useAuthStore.getState().user;
            if (!authUser || !authUser.uid) {
                useAuthStore.getState().openAuthModal();
                set({ loading: false });
                return;
            }
            const currentUserId = authUser.uid;

            try {
                const response = await apiSendMessage({
                    message: lastUserMsg.content || "Please review and analyze this attached medical image / symptom.",
                    conversationId: conv.backendConversationId,
                    image: lastUserMsg.image,
                    userId: currentUserId,
                });

                const newAiMsg: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: response.response,
                    timestamp: new Date(),
                };

                set((state) => {
                    const updated = state.conversations.map((c) => {
                        if (c.id === activeConversationId) {
                            return {
                                ...c,
                                messages: [...c.messages, newAiMsg],
                            };
                        }
                        return c;
                    });
                    saveConversations(updated);
                    return { conversations: updated, loading: false };
                });
            } catch {
                set({ loading: false });
            }
        },
    };
});