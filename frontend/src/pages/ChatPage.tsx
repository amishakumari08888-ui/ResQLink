import MainLayout from "../layouts/MainLayout";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useChatStore } from "../store/chatStore";

export default function ChatPage() {
    const {
        conversations,
        activeConversationId,
        loading,
        send,
    } = useChatStore();

    const activeConv = conversations.find((c) => c.id === activeConversationId);
    const messages = activeConv ? activeConv.messages : [];

    const handleSendMessage = (userMessage: string, image?: string) => {
        send(userMessage, image);
    };

    return (
        <MainLayout>
            <ChatWindow
                messages={messages}
                loading={loading}
                onSend={handleSendMessage}
            />

            <ChatInput
                onSend={handleSendMessage}
                loading={loading}
                disabled={loading}
            />
        </MainLayout>
    );
}