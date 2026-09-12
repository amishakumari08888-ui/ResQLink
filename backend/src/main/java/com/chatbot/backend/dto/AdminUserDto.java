package com.chatbot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDto {
    private Long id;
    private String firebaseUid;
    private String email;
    private String displayName;
    private String photoUrl;
    private String authProvider;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    private long totalTokens;
    private long inputTokens;
    private long outputTokens;
    private long totalPrompts;
    private long todayPrompts;
    private long todayTokens;
    private long conversationCount;
}
