package com.chatbot.backend.controller;

import com.chatbot.backend.dto.AdminStatsDto;
import com.chatbot.backend.dto.AdminUserDto;
import com.chatbot.backend.dto.DailyUsageDto;
import com.chatbot.backend.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@Slf4j
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("UP");
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        log.info("Fetching admin dashboard stats");
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getUsers() {
        log.info("Fetching admin users list with token metrics");
        return ResponseEntity.ok(adminService.getAllUsersWithStats());
    }

    @GetMapping("/daily-usage")
    public ResponseEntity<List<DailyUsageDto>> getDailyUsage(
            @RequestParam(name = "days", defaultValue = "7") int days) {
        log.info("Fetching daily token usage for last {} days", days);
        return ResponseEntity.ok(adminService.getDailyUsage(days));
    }
}
