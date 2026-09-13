package com.chatbot.backend.controller;

import com.chatbot.backend.dto.ChatRequest;
import com.chatbot.backend.dto.ChatResponse;
import com.chatbot.backend.entity.ConversationRecord;
import com.chatbot.backend.repository.ConversationRepository;
import com.chatbot.backend.service.ChatService;
import com.chatbot.backend.service.UsageLimitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UsageLimitService usageLimitService;
    private final ConversationRepository conversationRepository;
    private final com.chatbot.backend.repository.UserAccountRepository userAccountRepository;

    public ChatController(
            ChatService chatService,
            UsageLimitService usageLimitService,
            ConversationRepository conversationRepository,
            com.chatbot.backend.repository.UserAccountRepository userAccountRepository) {
        this.chatService = chatService;
        this.usageLimitService = usageLimitService;
        this.conversationRepository = conversationRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(
            @RequestBody ChatRequest request) {

        boolean hasMessage = request.getMessage() != null && !request.getMessage().trim().isEmpty();
        boolean hasImage = request.getImage() != null && !request.getImage().trim().isEmpty();

        if (!hasMessage && !hasImage) {
            return ResponseEntity.badRequest().build();
        }

        String conversationId = request.getConversationId();

        if (conversationId == null || conversationId.isBlank()) {
            conversationId = UUID.randomUUID().toString();
        }

        // Enforce Authentication and PostgreSQL persistence before Chat (Force Login)
        String userId = request.getUserId() != null ? request.getUserId().trim() : "";
        if (userId.isEmpty() || userId.equalsIgnoreCase("anonymous-guest") || userId.equalsIgnoreCase("anonymous-patient")) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(new ChatResponse("Authentication required: Please sign in with Google to consult Emma.", conversationId, 0));
        }

        if (!userAccountRepository.existsByFirebaseUid(userId)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(new ChatResponse("Access denied: User account is not registered in PostgreSQL database. Please log in with Google to use the chatbot.", conversationId, 0));
        }

        try {

            String messageToSend = hasMessage ? request.getMessage().trim() : "Please analyze this attached medical image / symptom.";

            String response = chatService.chat(
                    userId,
                    conversationId,
                    messageToSend,
                    request.getImage());

            // Save / update conversation in database
            final String finalConvId = conversationId;
            final String finalUserId = userId;
            final String promptPreview = messageToSend.length() > 40 ? messageToSend.substring(0, 40) + "..." : messageToSend;

            conversationRepository.findByConversationId(finalConvId)
                    .map(conv -> {
                        conv.setMessageCount(conv.getMessageCount() + 2); // user + assistant
                        conv.setUpdatedAt(LocalDateTime.now());
                        return conversationRepository.save(conv);
                    })
                    .orElseGet(() -> {
                        ConversationRecord newConv = new ConversationRecord(finalConvId, finalUserId, promptPreview);
                        newConv.setMessageCount(2);
                        return conversationRepository.save(newConv);
                    });

            return ResponseEntity.ok(
                    new ChatResponse(
                            response,
                            conversationId,
                            0));

        } catch (com.chatbot.backend.exception.AiLimitExceededException e) {
            // Re-throw so GlobalExceptionHandler handles it with 429
            throw e;
        } catch (Exception e) {

            log.error(
                    "Chat processing failed for conversation {}",
                    conversationId,
                    e);

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    @GetMapping("/usage")
    public ResponseEntity<UsageLimitService.UsageStatus> getUsage(
            @RequestParam(value = "userId", defaultValue = "anonymous-guest") String userId) {
        return ResponseEntity.ok(usageLimitService.getUsage(userId));
    }
}