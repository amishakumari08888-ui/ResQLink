package com.chatbot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {
    private long totalUsers;
    private long totalTokens;
    private long totalInputTokens;
    private long totalOutputTokens;
    private long totalPrompts;
    private long totalConversations;

    private long todayUsersActive;
    private long todayTokens;
    private long todayInputTokens;
    private long todayOutputTokens;
    private long todayPrompts;

    private String aiModel;
}
