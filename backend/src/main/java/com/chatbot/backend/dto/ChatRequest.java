package com.chatbot.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    private String message;

    @JsonProperty("conversation_id")
    @JsonAlias({"conversationId", "conversation_id"})
    private String conversationId;

    private String metadata;
    private String image;

    @JsonProperty("user_id")
    @JsonAlias({"userId", "user_id"})
    private String userId;
}