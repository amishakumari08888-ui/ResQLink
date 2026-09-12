package com.chatbot.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyUsageDto {
    private LocalDate date;
    private long totalTokens;
    private long inputTokens;
    private long outputTokens;
    private long promptCount;
    private long activeUsers;
}
