package com.wasteredistribution.controller;

import com.wasteredistribution.dto.AuthRequest;
import com.wasteredistribution.dto.AuthResponse;
import com.wasteredistribution.dto.RegisterRequest;
import com.wasteredistribution.service.AuthService;
import com.wasteredistribution.service.ReceiverAuthService;
import com.wasteredistribution.entity.Session;
import com.wasteredistribution.config.SessionAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ReceiverAuthService receiverAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/receiver/register")
    public ResponseEntity<AuthResponse> registerReceiver(@RequestBody RegisterRequest request) {
        AuthResponse response = receiverAuthService.register(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/receiver/login")
    public ResponseEntity<AuthResponse> loginReceiver(@RequestBody AuthRequest request) {
        AuthResponse response = receiverAuthService.login(request);
        return response.isSuccess()
                ? ResponseEntity.ok(response)
                : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        Session session = (Session) request.getAttribute(SessionAuthFilter.AUTHENTICATED_SESSION);
        return ResponseEntity.ok(authService.logout(session.getToken()));
    }
}
