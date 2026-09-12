package com.chatbot.backend.controller;

import com.chatbot.backend.dto.UserSyncRequest;
import com.chatbot.backend.entity.UserAccount;
import com.chatbot.backend.repository.UserAccountRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5135"})
@Slf4j
public class UserController {

    private final UserAccountRepository userAccountRepository;

    public UserController(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @PostMapping("/sync")
    public synchronized ResponseEntity<UserAccount> syncUser(@Valid @RequestBody UserSyncRequest request) {
        log.info("Syncing user with Firebase UID: {}", request.getFirebaseUid());

        try {
            UserAccount user = userAccountRepository.findByFirebaseUid(request.getFirebaseUid())
                    .map(existing -> {
                        if (request.getEmail() != null) existing.setEmail(request.getEmail());
                        if (request.getDisplayName() != null) existing.setDisplayName(request.getDisplayName());
                        if (request.getPhotoUrl() != null) existing.setPhotoUrl(request.getPhotoUrl());
                        if (request.getAuthProvider() != null) existing.setAuthProvider(request.getAuthProvider());
                        existing.setLastLoginAt(LocalDateTime.now());
                        return userAccountRepository.save(existing);
                    })
                    .orElseGet(() -> {
                        UserAccount newUser = new UserAccount(
                                request.getFirebaseUid(),
                                request.getEmail(),
                                request.getDisplayName(),
                                request.getPhotoUrl(),
                                request.getAuthProvider()
                        );
                        return userAccountRepository.save(newUser);
                    });

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.warn("Concurrent sync caught for UID {}: {}. Recovering existing record.", request.getFirebaseUid(), e.getMessage());
            return userAccountRepository.findByFirebaseUid(request.getFirebaseUid())
                    .map(ResponseEntity::ok)
                    .orElseThrow(() -> new RuntimeException("Failed to persist or retrieve user account", e));
        }
    }

    @GetMapping("/{firebaseUid}")
    public ResponseEntity<UserAccount> getUserProfile(@PathVariable String firebaseUid) {
        return userAccountRepository.findByFirebaseUid(firebaseUid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
