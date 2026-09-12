package com.chatbot.backend.service;

import com.chatbot.backend.dto.AdminStatsDto;
import com.chatbot.backend.dto.AdminUserDto;
import com.chatbot.backend.dto.DailyUsageDto;
import com.chatbot.backend.entity.AiUsage;
import com.chatbot.backend.entity.UserAccount;
import com.chatbot.backend.repository.AiUsageRepository;
import com.chatbot.backend.repository.ConversationRepository;
import com.chatbot.backend.repository.UserAccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AdminService {

    private final UserAccountRepository userAccountRepository;
    private final AiUsageRepository aiUsageRepository;
    private final ConversationRepository conversationRepository;
    private final GroqService groqService;

    public AdminService(
            UserAccountRepository userAccountRepository,
            AiUsageRepository aiUsageRepository,
            ConversationRepository conversationRepository,
            GroqService groqService) {
        this.userAccountRepository = userAccountRepository;
        this.aiUsageRepository = aiUsageRepository;
        this.conversationRepository = conversationRepository;
        this.groqService = groqService;
    }

    public AdminStatsDto getStats() {
        LocalDate today = LocalDate.now();

        long totalUsers = userAccountRepository.count();
        long totalInputTokens = aiUsageRepository.sumAllInputTokens();
        long totalOutputTokens = aiUsageRepository.sumAllOutputTokens();
        long totalTokens = totalInputTokens + totalOutputTokens;
        long totalPrompts = aiUsageRepository.sumAllPromptCount();
        long totalConversations = conversationRepository.count();

        long todayInputTokens = aiUsageRepository.sumInputTokensByDate(today);
        long todayOutputTokens = aiUsageRepository.sumOutputTokensByDate(today);
        long todayTokens = todayInputTokens + todayOutputTokens;
        long todayPrompts = aiUsageRepository.sumPromptCountByDate(today);
        long todayUsersActive = aiUsageRepository.countActiveUsersByDate(today);

        String model = groqService.getModel();

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .totalTokens(totalTokens)
                .totalInputTokens(totalInputTokens)
                .totalOutputTokens(totalOutputTokens)
                .totalPrompts(totalPrompts)
                .totalConversations(totalConversations)
                .todayUsersActive(todayUsersActive)
                .todayTokens(todayTokens)
                .todayInputTokens(todayInputTokens)
                .todayOutputTokens(todayOutputTokens)
                .todayPrompts(todayPrompts)
                .aiModel(model)
                .build();
    }

    public List<AdminUserDto> getAllUsersWithStats() {
        List<UserAccount> users = userAccountRepository.findAll(
                Sort.by(Sort.Direction.DESC, "lastLoginAt")
        );

        List<AiUsage> allUsage = aiUsageRepository.findAll();
        LocalDate today = LocalDate.now();

        // Group usage by userId
        Map<String, List<AiUsage>> usageByUser = allUsage.stream()
                .collect(Collectors.groupingBy(AiUsage::getUserId));

        return users.stream().map(user -> {
            String uid = user.getFirebaseUid();
            List<AiUsage> userUsages = usageByUser.getOrDefault(uid, Collections.emptyList());

            long inputTokens = userUsages.stream().mapToLong(AiUsage::getInputTokens).sum();
            long outputTokens = userUsages.stream().mapToLong(AiUsage::getOutputTokens).sum();
            long totalTokens = inputTokens + outputTokens;
            long totalPrompts = userUsages.stream().mapToLong(AiUsage::getPromptCount).sum();

            Optional<AiUsage> todayUsage = userUsages.stream()
                    .filter(u -> today.equals(u.getUsageDate()))
                    .findFirst();

            long todayPrompts = todayUsage.map(AiUsage::getPromptCount).orElse(0);
            long todayTokens = todayUsage.map(u -> (long) (u.getInputTokens() + u.getOutputTokens())).orElse(0L);

            long conversations = conversationRepository.countByUserId(uid);

            return AdminUserDto.builder()
                    .id(user.getId())
                    .firebaseUid(uid)
                    .email(user.getEmail())
                    .displayName(user.getDisplayName())
                    .photoUrl(user.getPhotoUrl())
                    .authProvider(user.getAuthProvider())
                    .createdAt(user.getCreatedAt())
                    .lastLoginAt(user.getLastLoginAt())
                    .inputTokens(inputTokens)
                    .outputTokens(outputTokens)
                    .totalTokens(totalTokens)
                    .totalPrompts(totalPrompts)
                    .todayPrompts(todayPrompts)
                    .todayTokens(todayTokens)
                    .conversationCount(conversations)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<DailyUsageDto> getDailyUsage(int days) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(days - 1L);

        List<AiUsage> usages = aiUsageRepository.findAll();

        Map<LocalDate, List<AiUsage>> groupedByDate = usages.stream()
                .filter(u -> u.getUsageDate() != null && !u.getUsageDate().isBefore(start) && !u.getUsageDate().isAfter(end))
                .collect(Collectors.groupingBy(AiUsage::getUsageDate));

        List<DailyUsageDto> dailyList = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            List<AiUsage> dayRecords = groupedByDate.getOrDefault(date, Collections.emptyList());
            long inputTokens = dayRecords.stream().mapToLong(AiUsage::getInputTokens).sum();
            long outputTokens = dayRecords.stream().mapToLong(AiUsage::getOutputTokens).sum();
            long prompts = dayRecords.stream().mapToLong(AiUsage::getPromptCount).sum();
            long activeUsers = dayRecords.stream().map(AiUsage::getUserId).distinct().count();

            dailyList.add(DailyUsageDto.builder()
                    .date(date)
                    .inputTokens(inputTokens)
                    .outputTokens(outputTokens)
                    .totalTokens(inputTokens + outputTokens)
                    .promptCount(prompts)
                    .activeUsers(activeUsers)
                    .build());
        }

        return dailyList;
    }
}
