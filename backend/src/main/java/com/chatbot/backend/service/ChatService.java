package com.chatbot.backend.service;

import com.chatbot.backend.dto.GroqRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class ChatService {

    private final GroqService groqService;
    private final UsageLimitService usageLimitService;

    /*
     * ============================================================
     * CONVERSATION STORAGE
     * ============================================================
     *
     * Temporary in-memory storage.
     *
     * Later:
     *
     * Redis -> active conversations
     * MySQL/PostgreSQL -> permanent conversation history
     */

    private final Map<String, LinkedList<GroqRequest.Message>> conversationHistories = new ConcurrentHashMap<>();

    /*
     * ============================================================
     * CONSTRUCTOR
     * ============================================================
     */

    public ChatService(
            GroqService groqService,
            UsageLimitService usageLimitService) {

        this.groqService = groqService;
        this.usageLimitService = usageLimitService;
    }

    /*
     * ============================================================
     * TEXT CHAT
     * ============================================================
     */

    public synchronized String chat(
            String userId,
            String conversationId,
            String userMessage) {

        return chat(
                userId,
                conversationId,
                userMessage,
                null);
    }

    /*
     * ============================================================
     * CHAT WITH OPTIONAL IMAGE
     * ============================================================
     */

    public synchronized String chat(
            String userId,
            String conversationId,
            String userMessage,
            String image) {

        /*
         * --------------------------------------------------------
         * VALIDATION
         * --------------------------------------------------------
         */

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User ID is required");
        }

        if (conversationId == null ||
                conversationId.isBlank()) {

            throw new IllegalArgumentException(
                    "Conversation ID is required");
        }

        boolean hasText = userMessage != null &&
                !userMessage.isBlank();

        boolean hasImage = image != null &&
                !image.isBlank();

        if (!hasText && !hasImage) {

            throw new IllegalArgumentException(
                    "Message or image is required");
        }

        /*
         * --------------------------------------------------------
         * CLEAN MESSAGE
         * --------------------------------------------------------
         */

        String cleanMessage;

        if (hasText) {

            cleanMessage = userMessage.trim();

        } else {

            cleanMessage = "Please analyze this attached medical image / symptom.";
        }

        /*
         * --------------------------------------------------------
         * USER USAGE LIMIT
         * --------------------------------------------------------
         *
         * The UsageLimitService should enforce:
         *
         * Maximum prompts per user = 8
         * Maximum tokens per user = 1200
         *
         * We estimate the input tokens here.
         */

        int estimatedInputTokens = estimateTokens(cleanMessage);

        usageLimitService.checkAndConsume(
                userId,
                estimatedInputTokens);

        /*
         * --------------------------------------------------------
         * CONVERSATION KEY
         * --------------------------------------------------------
         */

        String conversationKey = userId + ":" + conversationId;

        LinkedList<GroqRequest.Message> history = conversationHistories.computeIfAbsent(
                conversationKey,
                key -> new LinkedList<>());

        /*
         * --------------------------------------------------------
         * ADD USER MESSAGE
         * --------------------------------------------------------
         */

        GroqRequest.Message userChatMessage = new GroqRequest.Message(
                "user",
                cleanMessage);

        history.add(userChatMessage);

        /*
         * --------------------------------------------------------
         * LIMIT HISTORY
         * --------------------------------------------------------
         *
         * Keep only the latest 10 messages.
         */

        while (history.size() > 10) {

            history.removeFirst();
        }

        /*
         * --------------------------------------------------------
         * CALL GROQ
         * --------------------------------------------------------
         *
         * No paid/free user distinction.
         */

        String reply;

        try {

            reply = groqService.generateResponse(
                    cleanMessage,
                    image,
                    new ArrayList<>(history));

        } catch (Exception e) {

            log.error(
                    "Groq request failed for user {}",
                    userId,
                    e);

            /*
             * Remove user message because the AI request failed.
             */

            removeLastUserMessage(
                    history,
                    cleanMessage);

            throw new RuntimeException(
                    "Unable to generate Emma response",
                    e);
        }

        /*
         * --------------------------------------------------------
         * VALIDATE RESPONSE
         * --------------------------------------------------------
         */

        if (reply == null ||
                reply.isBlank()) {

            removeLastUserMessage(
                    history,
                    cleanMessage);

            throw new RuntimeException(
                    "Emma returned an empty response");
        }

        String cleanReply = reply.trim();

        /*
         * --------------------------------------------------------
         * ADD EMMA RESPONSE
         * --------------------------------------------------------
         */

        history.add(
                new GroqRequest.Message(
                        "assistant",
                        cleanReply));

        /*
         * --------------------------------------------------------
         * LIMIT HISTORY AGAIN
         * --------------------------------------------------------
         */

        while (history.size() > 10) {

            history.removeFirst();
        }

        /*
         * --------------------------------------------------------
         * OUTPUT TOKEN ESTIMATION
         * --------------------------------------------------------
         *
         * We estimate the response tokens as well.
         *
         * NOTE:
         * This is an estimate, not Groq's exact tokenizer.
         */

        int estimatedOutputTokens = estimateTokens(cleanReply);

        usageLimitService.recordOutputTokens(userId, estimatedOutputTokens);

        /*
         * --------------------------------------------------------
         * LOG TOKEN INFORMATION
         * --------------------------------------------------------
         */

        int estimatedTotalTokens = estimatedInputTokens +
                estimatedOutputTokens;

        log.debug(
                "Emma usage | user={} | inputTokens={} | outputTokens={} | totalTokens={}",
                userId,
                estimatedInputTokens,
                estimatedOutputTokens,
                estimatedTotalTokens);

        /*
         * --------------------------------------------------------
         * RETURN RESPONSE
         * --------------------------------------------------------
         */

        return cleanReply;
    }

    /*
     * ============================================================
     * TOKEN ESTIMATION
     * ============================================================
     *
     * Rough estimation:
     *
     * 1 token ≈ 4 characters
     *
     * This is NOT the exact Groq tokenizer.
     */

    private int estimateTokens(String text) {

        if (text == null ||
                text.isBlank()) {

            return 0;
        }

        return Math.max(
                1,
                (int) Math.ceil(
                        text.length() / 4.0));
    }

    /*
     * ============================================================
     * REMOVE FAILED USER MESSAGE
     * ============================================================
     */

    private void removeLastUserMessage(
            LinkedList<GroqRequest.Message> history,
            String cleanMessage) {

        if (history.isEmpty()) {
            return;
        }

        GroqRequest.Message lastMessage = history.getLast();

        if (lastMessage == null) {
            return;
        }

        if ("user".equalsIgnoreCase(
                lastMessage.getRole())
                &&
                cleanMessage.equals(
                        lastMessage.getContentAsString())) {

            history.removeLast();
        }
    }

    /*
     * ============================================================
     * CLEAR ONE CONVERSATION
     * ============================================================
     */

    public synchronized void clearHistory(
            String userId,
            String conversationId) {

        if (userId == null ||
                userId.isBlank()) {

            return;
        }

        if (conversationId == null ||
                conversationId.isBlank()) {

            return;
        }

        String conversationKey = userId + ":" + conversationId;

        conversationHistories.remove(
                conversationKey);
    }

    /*
     * ============================================================
     * CLEAR ALL CONVERSATIONS
     * ============================================================
     *
     * Useful during development/testing.
     */

    public synchronized void clearAllHistory() {

        conversationHistories.clear();
    }

    /*
     * ============================================================
     * GET CONVERSATION COUNT
     * ============================================================
     *
     * Optional development helper.
     */

    public int getActiveConversationCount() {

        return conversationHistories.size();
    }
}