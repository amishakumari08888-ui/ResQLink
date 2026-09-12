package com.chatbot.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSyncRequest {

    @NotBlank(message = "Firebase UID is required")
    private String firebaseUid;

    private String email;

    private String displayName;

    private String photoUrl;

    private String authProvider;
}
