package com.wasteredistribution.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wasteredistribution.entity.Session;
import com.wasteredistribution.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

@Component
public class SessionAuthFilter extends OncePerRequestFilter {

    public static final String AUTHENTICATED_SESSION = "authenticatedSession";
    public static final String AUTHENTICATED_USER_ID = "authenticatedUserId";
    public static final String AUTHENTICATED_USER_TYPE = "authenticatedUserType";

    private final SessionService sessionService;
    private final ObjectMapper objectMapper;

    public SessionAuthFilter(SessionService sessionService, ObjectMapper objectMapper) {
        this.sessionService = sessionService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !path.startsWith("/api/")
                || "OPTIONS".equalsIgnoreCase(request.getMethod())
                || "/api/auth/login".equals(path)
                || "/api/auth/register".equals(path)
                || "/api/auth/receiver/login".equals(path)
                || "/api/auth/receiver/register".equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = extractBearerToken(request.getHeader("Authorization"));
        if (token == null) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Authentication required.");
            return;
        }

        Optional<Session> session = sessionService.findValidSession(token);
        if (session.isEmpty()) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Session is invalid or expired.");
            return;
        }

        Session authenticatedSession = session.get();
        request.setAttribute(AUTHENTICATED_SESSION, authenticatedSession);
        request.setAttribute(AUTHENTICATED_USER_ID, authenticatedSession.getUserId());
        request.setAttribute(AUTHENTICATED_USER_TYPE, authenticatedSession.getUserType());
        filterChain.doFilter(request, response);
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null
                || !authorizationHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return null;
        }
        String token = authorizationHeader.substring(7).trim();
        return token.isEmpty() ? null : token;
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "success", false,
                "message", message));
    }
}
