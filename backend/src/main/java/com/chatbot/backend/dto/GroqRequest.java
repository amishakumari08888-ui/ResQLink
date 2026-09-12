package com.chatbot.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for Groq Chat Completions API.
 *
 * Supports:
 * - Normal text messages
 * - Multimodal messages containing text + image
 * - max_tokens
 * - temperature
 * - top_p
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroqRequest {

    private String model;

    private List<Message> messages;

    @JsonProperty("max_tokens")
    private int maxTokens;

    @JsonProperty("temperature")
    private double temperature;

    @JsonProperty("top_p")
    private double topP;

    /**
     * Default constructor for normal requests.
     */
    public GroqRequest(String model, List<Message> messages) {
        this.model = model;
        this.messages = messages;
        this.maxTokens = 1024;
        this.temperature = 0.7;
        this.topP = 1.0;
    }

    /**
     * Constructor with custom max output tokens.
     */
    public GroqRequest(
            String model,
            List<Message> messages,
            int maxTokens) {

        this.model = model;
        this.messages = messages;
        this.maxTokens = maxTokens;
        this.temperature = 0.7;
        this.topP = 1.0;
    }

    /**
     * Individual Groq message.
     *
     * content is Object because:
     *
     * Text message:
     * "Hello"
     *
     * Multimodal message:
     * [
     * {
     * "type": "text",
     * "text": "Analyze this"
     * },
     * {
     * "type": "image_url",
     * "image_url": {
     * "url": "..."
     * }
     * }
     * ]
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {

        private String role;

        private Object content;

        /**
         * Constructor for normal text messages.
         */
        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        /**
         * Helper method used internally by the backend.
         *
         * IMPORTANT:
         * 
         * @JsonIgnore prevents Jackson from sending this as:
         *
         *             "contentAsString": "..."
         *
         *             to Groq.
         */
        @JsonIgnore
        public String getContentAsString() {

            if (content == null) {
                return "";
            }

            if (content instanceof String) {
                return (String) content;
            }

            return content.toString();
        }
    }
}