package com.chatbot.backend.exception;

public class AiLimitExceededException extends RuntimeException {

    private final int promptsUsed;
    private final int promptLimit;
    private final int inputTokensUsed;
    private final int inputTokenLimit;

    public AiLimitExceededException(
            String message,
            int promptsUsed,
            int promptLimit,
            int inputTokensUsed,
            int inputTokenLimit) {
        super(message);
        this.promptsUsed = promptsUsed;
        this.promptLimit = promptLimit;
        this.inputTokensUsed = inputTokensUsed;
        this.inputTokenLimit = inputTokenLimit;
    }

    public int getPromptsUsed() {
        return promptsUsed;
    }

    public int getPromptLimit() {
        return promptLimit;
    }

    public int getInputTokensUsed() {
        return inputTokensUsed;
    }

    public int getInputTokenLimit() {
        return inputTokenLimit;
    }
}