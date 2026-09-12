package com.chatbot.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "ai_usage", uniqueConstraints = {
        @UniqueConstraint(name = "uk_ai_usage_user_date", columnNames = { "user_id", "usage_date" })
})
public class AiUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "prompt_count", nullable = false)
    private int promptCount = 0;

    @Column(name = "input_tokens", nullable = false)
    private int inputTokens = 0;

    @Column(name = "output_tokens", nullable = false)
    private int outputTokens = 0;

    public AiUsage() {
    }

    public AiUsage(String userId, LocalDate usageDate) {
        this.userId = userId;
        this.usageDate = usageDate;
    }

    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public LocalDate getUsageDate() {
        return usageDate;
    }

    public int getPromptCount() {
        return promptCount;
    }

    public int getInputTokens() {
        return inputTokens;
    }

    public int getOutputTokens() {
        return outputTokens;
    }

    public int getTotalTokens() {
        return inputTokens + outputTokens;
    }

    public void setPromptCount(int promptCount) {
        this.promptCount = promptCount;
    }

    public void setInputTokens(int inputTokens) {
        this.inputTokens = inputTokens;
    }

    public void setOutputTokens(int outputTokens) {
        this.outputTokens = outputTokens;
    }
}