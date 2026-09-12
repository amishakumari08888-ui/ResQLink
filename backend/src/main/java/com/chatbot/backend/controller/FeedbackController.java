package com.chatbot.backend.controller;

import com.chatbot.backend.dto.FeedbackRequest;
import com.chatbot.backend.entity.Feedback;
import com.chatbot.backend.repository.FeedbackRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5135"})
@Slf4j
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        log.info("Received feedback from user {}: rating={}, trigger={}",
                request.getUserId(), request.getRating(), request.getTriggerReason());

        Feedback feedback = new Feedback(
                request.getUserId(),
                request.getUserEmail(),
                request.getRating(),
                request.getReview(),
                request.getTriggerReason()
        );

        Feedback saved = feedbackRepository.save(feedback);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Thank you for your feedback!",
                "id", saved.getId()
        ));
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Feedback>> getUserFeedback(@PathVariable String userId) {
        return ResponseEntity.ok(feedbackRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }
}
