package com.chatbot.backend.repository;

import com.chatbot.backend.entity.AiUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AiUsageRepository extends JpaRepository<AiUsage, Long> {

    Optional<AiUsage> findByUserIdAndUsageDate(
            String userId,
            LocalDate usageDate);

    List<AiUsage> findByUserId(String userId);

    List<AiUsage> findAllByOrderByUsageDateDesc();

    List<AiUsage> findByUsageDate(LocalDate usageDate);

    @Query("SELECT COALESCE(SUM(u.inputTokens), 0) FROM AiUsage u")
    long sumAllInputTokens();

    @Query("SELECT COALESCE(SUM(u.outputTokens), 0) FROM AiUsage u")
    long sumAllOutputTokens();

    @Query("SELECT COALESCE(SUM(u.promptCount), 0) FROM AiUsage u")
    long sumAllPromptCount();

    @Query("SELECT COALESCE(SUM(u.inputTokens), 0) FROM AiUsage u WHERE u.usageDate = :date")
    long sumInputTokensByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(u.outputTokens), 0) FROM AiUsage u WHERE u.usageDate = :date")
    long sumOutputTokensByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(u.promptCount), 0) FROM AiUsage u WHERE u.usageDate = :date")
    long sumPromptCountByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT u.userId) FROM AiUsage u WHERE u.usageDate = :date")
    long countActiveUsersByDate(@Param("date") LocalDate date);
}