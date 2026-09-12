package com.chatbot.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_accounts", indexes = {
        @Index(name = "idx_user_firebase_uid", columnList = "firebase_uid")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "firebase_uid", nullable = false, unique = true)
    private String firebaseUid;

    @Column(name = "email")
    private String email;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "auth_provider")
    private String authProvider; // "google", "password", "anonymous"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt = LocalDateTime.now();

    public UserAccount(String firebaseUid, String email, String displayName, String photoUrl, String authProvider) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.displayName = displayName;
        this.photoUrl = photoUrl;
        this.authProvider = authProvider;
        this.createdAt = LocalDateTime.now();
        this.lastLoginAt = LocalDateTime.now();
    }
}
