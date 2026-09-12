package com.chatbot.backend.controller;

import com.chatbot.backend.dto.AdminStatsDto;
import com.chatbot.backend.dto.AdminUserDto;
import com.chatbot.backend.dto.DailyUsageDto;
import com.chatbot.backend.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @Test
    void testGetStats() throws Exception {
        AdminStatsDto stats = AdminStatsDto.builder()
                .totalUsers(15)
                .totalTokens(5400)
                .totalInputTokens(3000)
                .totalOutputTokens(2400)
                .totalPrompts(42)
                .totalConversations(20)
                .todayUsersActive(5)
                .todayTokens(800)
                .todayPrompts(8)
                .aiModel("openai/gpt-oss-120b")
                .build();

        given(adminService.getStats()).willReturn(stats);

        mockMvc.perform(get("/api/admin/stats").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(15))
                .andExpect(jsonPath("$.totalTokens").value(5400))
                .andExpect(jsonPath("$.totalInputTokens").value(3000))
                .andExpect(jsonPath("$.totalOutputTokens").value(2400))
                .andExpect(jsonPath("$.totalPrompts").value(42));
    }

    @Test
    void testGetUsers() throws Exception {
        AdminUserDto user = AdminUserDto.builder()
                .id(1L)
                .firebaseUid("test-uid-123")
                .email("test@example.com")
                .displayName("Test User")
                .authProvider("google")
                .totalTokens(450)
                .totalPrompts(3)
                .conversationCount(2)
                .createdAt(LocalDateTime.now())
                .lastLoginAt(LocalDateTime.now())
                .build();

        given(adminService.getAllUsersWithStats()).willReturn(List.of(user));

        mockMvc.perform(get("/api/admin/users").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firebaseUid").value("test-uid-123"))
                .andExpect(jsonPath("$[0].email").value("test@example.com"))
                .andExpect(jsonPath("$[0].totalTokens").value(450))
                .andExpect(jsonPath("$[0].totalPrompts").value(3));
    }

    @Test
    void testGetDailyUsage() throws Exception {
        DailyUsageDto daily = DailyUsageDto.builder()
                .date(LocalDate.now())
                .totalTokens(1200)
                .inputTokens(700)
                .outputTokens(500)
                .promptCount(10)
                .activeUsers(4)
                .build();

        given(adminService.getDailyUsage(7)).willReturn(List.of(daily));

        mockMvc.perform(get("/api/admin/daily-usage?days=7").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totalTokens").value(1200))
                .andExpect(jsonPath("$[0].promptCount").value(10))
                .andExpect(jsonPath("$[0].activeUsers").value(4));
    }
}
