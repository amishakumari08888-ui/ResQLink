package com.chatbot.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO from Groq Chat Completions API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroqResponse {

    private String id;

    private String object;

    private long created;

    private String model;

    private List<Choice> choices;

    @JsonProperty("usage")
    private Usage usage;

    /**
     * Individual completion choice.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Choice {

        private int index;

        private Message message;

        @JsonProperty("finish_reason")
        private String finishReason;

        /**
         * Message returned by Groq.
         */
        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Message {

            private String role;

            private String content;
        }
    }

    /**
     * Token usage information.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Usage {

        @JsonProperty("prompt_tokens")
        private int promptTokens;

        @JsonProperty("completion_tokens")
        private int completionTokens;

        @JsonProperty("total_tokens")
        private int totalTokens;
    }
}