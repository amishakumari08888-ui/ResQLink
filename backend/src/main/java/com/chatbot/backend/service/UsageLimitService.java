package com.chatbot.backend.service;

import com.chatbot.backend.entity.AiUsage;
import com.chatbot.backend.exception.AiLimitExceededException;
import com.chatbot.backend.repository.AiUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UsageLimitService {

    private static final int MAX_PROMPTS = 8;
    private static final int MAX_INPUT_TOKENS = 1200;

    private final AiUsageRepository usageRepository;

    public UsageLimitService(AiUsageRepository usageRepository) {
        this.usageRepository = usageRepository;
    }

    @Transactional
    public synchronized void checkAndConsume(
            String userId,
            int estimatedInputTokens) {

        LocalDate today = LocalDate.now();

        AiUsage usage = usageRepository
                .findByUserIdAndUsageDate(userId, today)
                .orElseGet(() -> {
                    AiUsage newUsage = new AiUsage(userId, today);

                    return usageRepository.save(newUsage);
                });

        // 8 PROMPT LIMIT
        if (usage.getPromptCount() >= MAX_PROMPTS) {

            throw new AiLimitExceededException(
                    "Daily free limit reached (8 prompts or 1,200 tokens). Please leave your feedback!",
                    usage.getPromptCount(),
                    MAX_PROMPTS,
                    usage.getInputTokens(),
                    MAX_INPUT_TOKENS);
        }

        // 1200 INPUT TOKEN LIMIT
        if (usage.getInputTokens() + estimatedInputTokens > MAX_INPUT_TOKENS) {

            throw new AiLimitExceededException(
                    "Daily free limit reached (8 prompts or 1,200 tokens). Please leave your feedback!",
                    usage.getPromptCount(),
                    MAX_PROMPTS,
                    usage.getInputTokens(),
                    MAX_INPUT_TOKENS);
        }

        // Consume one prompt
        usage.setPromptCount(
                usage.getPromptCount() + 1);

        // Consume estimated input tokens
        usage.setInputTokens(
                usage.getInputTokens() + estimatedInputTokens);

        usageRepository.save(usage);
    }

    @Transactional
    public synchronized void recordOutputTokens(String userId, int outputTokens) {
        if (outputTokens <= 0) return;

        LocalDate today = LocalDate.now();
        AiUsage usage = usageRepository
                .findByUserIdAndUsageDate(userId, today)
                .orElseGet(() -> new AiUsage(userId, today));

        usage.setOutputTokens(usage.getOutputTokens() + outputTokens);
        usageRepository.save(usage);
    }

    public UsageStatus getUsage(String userId) {

        LocalDate today = LocalDate.now();

        AiUsage usage = usageRepository
                .findByUserIdAndUsageDate(
                        userId,
                        today)
                .orElse(
                        new AiUsage(userId, today));

        return new UsageStatus(
                usage.getPromptCount(),
                MAX_PROMPTS,
                usage.getInputTokens(),
                MAX_INPUT_TOKENS);
    }

    public record UsageStatus(
            int promptsUsed,
            int promptLimit,
            int inputTokensUsed,
            int inputTokenLimit) {
    }
}