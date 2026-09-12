package com.chatbot.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks", indexes = {
        @Index(name = "idx_feedback_user", columnList = "user_id"),
        @Index(name = "idx_feedback_created", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "rating", nullable = false)
    private int rating; // 1 to 5

    @Column(name = "review", length = 2000)
    private String review;

    @Column(name = "trigger_reason")
    private String triggerReason; // "LIMIT_REACHED", "THREE_CONVERSATIONS", "MANUAL"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Feedback(String userId, String userEmail, int rating, String review, String triggerReason) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.rating = rating;
        this.review = review;
        this.triggerReason = triggerReason;
        this.createdAt = LocalDateTime.now();
    }
}
